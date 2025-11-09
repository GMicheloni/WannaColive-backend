/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pais } from './entities/pais.entity';
import { Ciudad } from 'src/cities/entities/ciudad.entity';
import * as paisesData from '../paises.json';

@Injectable()
export class CountriesService implements OnModuleInit {
  private readonly logger = new Logger(CountriesService.name);

  constructor(
    @InjectRepository(Pais)
    private readonly paisRepository: Repository<Pais>,
    @InjectRepository(Ciudad)
    private readonly ciudadRepository: Repository<Ciudad>,
  ) {}

  async onModuleInit() {
    await this.seedPaisesYciudades();
  }

  async seedPaisesYciudades() {
    const data: Array<{ nombre: string; ciudades: string[] }> =
      (paisesData as any).default ?? (paisesData as any);

    if (!Array.isArray(data) || data.length === 0) {
      this.logger.warn('No hay datos en paises.json para sembrar');
      return { inserted: 0 };
    }

    let insertedPaises = 0;
    let insertedCiudades = 0;

    for (const item of data) {
      const nombrePais = item.nombre.trim();
      if (!nombrePais) continue;

      // Si el país no existe, lo crea
      let pais = await this.paisRepository.findOne({
        where: { nombre: nombrePais },
      });

      if (!pais) {
        pais = this.paisRepository.create({ nombre: nombrePais });
        await this.paisRepository.save(pais);
        insertedPaises++;
      }

      // Cargar ciudades asociadas
      for (const ciudadNombre of item.ciudades) {
        const ciudadExiste = await this.ciudadRepository.findOne({
          where: { nombre: ciudadNombre, pais: { id: pais.id } },
          relations: ['pais'],
        });

        if (!ciudadExiste) {
          const ciudad = this.ciudadRepository.create({
            nombre: ciudadNombre,
            pais,
          });
          await this.ciudadRepository.save(ciudad);
          insertedCiudades++;
        }
      }
    }

    this.logger.log(
      `🌎 Seeder: ${insertedPaises} países y ${insertedCiudades} ciudades insertadas`,
    );

    return { insertedPaises, insertedCiudades };
  }
  getAllCountries() {
    return this.paisRepository.find();
  }
}
