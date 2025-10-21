/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// ...existing code...
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as comonosData from '../../users/comonosconocio.json';
import { Comonosconocio } from './entities/comonosconocio.entity';
// ...existing code...

@Injectable()
export class ComonosconocioService implements OnModuleInit {
  private readonly logger = new Logger(ComonosconocioService.name);

  constructor(
    @InjectRepository(Comonosconocio)
    private readonly comonosRepository: Repository<Comonosconocio>,
  ) {}

  async onModuleInit() {
    await this.seederComonos();
  }

  async seederComonos() {
    const data: Array<{ como?: string }> =
      (comonosData as any).default ?? (comonosData as any);

    if (!Array.isArray(data) || data.length === 0) {
      this.logger.warn('No hay datos en comonosconocio.json para sembrar');
      return { inserted: 0 };
    }

    let inserted = 0;
    for (const item of data) {
      const nombre = item?.como?.trim();
      if (!nombre) continue;

      const exists = await this.comonosRepository.findOne({
        where: { como: nombre },
      });
      if (!exists) {
        const entity = this.comonosRepository.create({ como: nombre });
        await this.comonosRepository.save(entity);
        inserted++;
      }
    }

    this.logger.log(`Comonosconocio seeder: ${inserted} registros insertados`);
    return { inserted };
  }
}
// ...existing code...
