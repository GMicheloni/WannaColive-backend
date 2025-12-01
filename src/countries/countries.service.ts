/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Pais } from './entities/pais.entity';
import { Ciudad } from 'src/cities/entities/ciudad.entity';
import * as countriesData from '../countries+cities.json';

@Injectable()
export class CountriesService implements OnModuleInit {
  private readonly logger = new Logger(CountriesService.name);

  constructor(
    @InjectRepository(Pais)
    private readonly paisRepository: Repository<Pais>,
    @InjectRepository(Ciudad)
    private readonly ciudadRepository: Repository<Ciudad>,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    try {
      await this.seedPaisesYciudades();
    } catch (error) {
      this.logger.error(
        `Error en onModuleInit de CountriesService: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async seedPaisesYciudades() {
    const startTime = Date.now();
    const data: Array<{ name: string; cities: string[] }> =
      (countriesData as any).default ?? (countriesData as any);

    if (!Array.isArray(data) || data.length === 0) {
      this.logger.warn('No hay datos en countries+cities.json para sembrar');
      return { inserted: 0 };
    }

    this.logger.log(`🚀 Iniciando carga optimizada de ${data.length} países...`);

    // Usar transacción para mejor rendimiento
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Cargar TODOS los países existentes de una vez
      this.logger.log('📦 Cargando países existentes...');
      const paisesExistentes = await queryRunner.manager.find(Pais);
      const paisesMap = new Map<string, Pais>();
      paisesExistentes.forEach((p) => paisesMap.set(p.nombre.toLowerCase(), p));

      // 2. Preparar países nuevos para bulk insert
      const paisesNuevos: Pais[] = [];
      const paisesParaProcesar = new Map<string, { pais: Pais; ciudades: string[] }>();

      for (const item of data) {
        const nombrePais = item.name?.trim();
        if (!nombrePais) continue;

        const nombrePaisLower = nombrePais.toLowerCase();
        let pais = paisesMap.get(nombrePaisLower);

        if (!pais) {
          pais = queryRunner.manager.create(Pais, { nombre: nombrePais });
          paisesNuevos.push(pais);
          paisesMap.set(nombrePaisLower, pais);
        }

        paisesParaProcesar.set(nombrePaisLower, {
          pais,
          ciudades: item.cities || [],
        });
      }

      // 3. Bulk insert de países nuevos usando SQL raw para máximo rendimiento
      let insertedPaises = 0;
      if (paisesNuevos.length > 0) {
        this.logger.log(`💾 Insertando ${paisesNuevos.length} países en bulk...`);
        
        // Usar SQL raw con INSERT múltiple (más rápido)
        const batchSize = 1000;
        for (let i = 0; i < paisesNuevos.length; i += batchSize) {
          const batch = paisesNuevos.slice(i, i + batchSize);
          const values = batch
            .map((p) => `('${p.nombre.replace(/'/g, "''")}')`)
            .join(',');
          
          await queryRunner.manager.query(
            `INSERT INTO paises (nombre) VALUES ${values}`,
          );
        }
        
        insertedPaises = paisesNuevos.length;
        
        // Recargar países nuevos para obtener sus IDs (solo los que acabamos de insertar)
        const nombresPaisesNuevos = paisesNuevos.map((p) => p.nombre);
        const paisesRecargados = await queryRunner.manager
          .createQueryBuilder(Pais, 'pais')
          .where('pais.nombre IN (:...nombres)', { nombres: nombresPaisesNuevos })
          .getMany();
        
        // Actualizar el mapa con los IDs
        paisesRecargados.forEach((p) => {
          paisesMap.set(p.nombre.toLowerCase(), p);
        });
      }

      // 4. Detectar nombre de columna FK para ciudades (una sola vez)
      let fkColumnName = 'paisId';
      try {
        const fkColumnResult = await queryRunner.manager.query(`
          SELECT column_name 
          FROM information_schema.key_column_usage 
          WHERE table_name = 'ciudades' 
          AND constraint_name LIKE '%_fkey'
          LIMIT 1
        `);
        if (fkColumnResult?.[0]?.column_name) {
          fkColumnName = fkColumnResult[0].column_name;
        }
      } catch (e) {
        // Si falla, usar el nombre por defecto
        this.logger.warn(`No se pudo detectar columna FK, usando 'paisId' por defecto`);
      }
      
      // 5. Cargar TODAS las ciudades existentes de una vez (solo nombre y FK, más rápido)
      this.logger.log('📦 Cargando ciudades existentes...');
      const ciudadesExistentes = await queryRunner.manager.query(
        `SELECT nombre, "${fkColumnName}" as "paisId" FROM ciudades`,
      );

      const ciudadesMap = new Map<string, boolean>();
      ciudadesExistentes.forEach((c: { nombre: string; paisId: number }) => {
        const key = `${c.paisId}-${c.nombre.toLowerCase()}`;
        ciudadesMap.set(key, true);
      });

      // 6. Preparar ciudades nuevas para bulk insert
      const ciudadesNuevas: Array<{ nombre: string; paisId: number }> = [];
      for (const { pais, ciudades } of paisesParaProcesar.values()) {
        if (!pais.id) {
          const paisConId = paisesMap.get(pais.nombre.toLowerCase());
          if (!paisConId?.id) continue;
          pais.id = paisConId.id;
        }

        for (const ciudadNombre of ciudades) {
          const nombreCiudad = ciudadNombre?.trim();
          if (!nombreCiudad) continue;

          const key = `${pais.id}-${nombreCiudad.toLowerCase()}`;
          if (!ciudadesMap.has(key)) {
            ciudadesNuevas.push({
              nombre: nombreCiudad,
              paisId: pais.id,
            });
            ciudadesMap.set(key, true); // Marcar como procesada
          }
        }
      }

      // 7. Bulk insert de ciudades nuevas usando SQL raw para máximo rendimiento
      let insertedCiudades = 0;
      if (ciudadesNuevas.length > 0) {
        this.logger.log(`💾 Insertando ${ciudadesNuevas.length} ciudades en bulk...`);
        
        // Usar SQL raw directo con INSERT múltiple (mucho más rápido)
        const batchSize = 2000;
        const escapedFkColumn = `"${fkColumnName}"`;
        
        for (let i = 0; i < ciudadesNuevas.length; i += batchSize) {
          const batch = ciudadesNuevas.slice(i, i + batchSize);
          const valuesDirect = batch
            .map((c) => `('${c.nombre.replace(/'/g, "''")}', ${c.paisId})`)
            .join(',');
          
          await queryRunner.manager.query(
            `INSERT INTO ciudades (nombre, ${escapedFkColumn}) VALUES ${valuesDirect}`,
          );
        }
        
        insertedCiudades = ciudadesNuevas.length;
      }

      await queryRunner.commitTransaction();

      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(
        `✅ Seeder completado: ${insertedPaises} países y ${insertedCiudades} ciudades insertadas en ${elapsedTime}s`,
      );

      return { insertedPaises, insertedCiudades };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `❌ Error en seedPaisesYciudades: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async getAllCountries() {
    try {
      return await this.paisRepository.find();
    } catch (error) {
      this.logger.error(
        `Error en getAllCountries: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new Error('Error al obtener países');
    }
  }
}
