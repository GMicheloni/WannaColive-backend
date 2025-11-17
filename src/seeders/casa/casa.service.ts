/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as casasData from '../../casa.json';
import { Casa } from './entities/casa.entity';

@Injectable()
export class CasaService implements OnModuleInit {
  private readonly logger = new Logger(CasaService.name);

  constructor(
    @InjectRepository(Casa)
    private readonly casaRepository: Repository<Casa>,
  ) {}

  async onModuleInit() {
    try {
      await this.seederCasas();
    } catch (error) {
      this.logger.error(
        `Error en onModuleInit de CasaService: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async seederCasas() {
    const data: Array<{ id?: number; name?: string }> =
      (casasData as any).default ?? (casasData as any);
    if (!Array.isArray(data) || data.length === 0) {
      this.logger.warn('No hay datos en casa.json para sembrar');
      return { inserted: 0 };
    }

    let inserted = 0;
    for (const item of data) {
      const nombre = item?.name?.trim();
      if (!nombre) continue;

      const exists = await this.casaRepository.findOne({
        where: { nombre: nombre },
      });
      if (!exists) {
        const entity = this.casaRepository.create({ nombre: nombre });
        await this.casaRepository.save(entity);
        inserted++;
      }
    }

    this.logger.log(`Casa seeder: ${inserted} registros insertados`);
    return { inserted };
  }

  findAll() {
    return this.casaRepository.find();
  }
}

