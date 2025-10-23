/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Asunto } from './entities/asunto.entity';
import { Repository } from 'typeorm';
import * as asuntodata from '../../asunto.json';

@Injectable()
export class AsuntoService implements OnModuleInit {
  findAll() {
    return this.asuntoRepository.find();
  }
  private readonly logger = new Logger(AsuntoService.name);

  constructor(
    @InjectRepository(Asunto)
    private readonly asuntoRepository: Repository<Asunto>,
  ) {}

  async onModuleInit() {
    await this.seeder();
  }

  async seeder() {
    const data: Array<{ tipo: string }> =
      (asuntodata as any).default ?? (asuntodata as any);
    if (!Array.isArray(data) || data.length === 0) {
      this.logger.warn('No hay datos en asunto.json para sembrar');
      return { inserted: 0 };
    }

    let inserted = 0;
    for (const item of data) {
      if (!item?.tipo) continue;
      const exists = await this.asuntoRepository.findOne({
        where: { tipo: item.tipo },
      });
      if (!exists) {
        const entity = this.asuntoRepository.create({ tipo: item.tipo });
        await this.asuntoRepository.save(entity);
        inserted++;
      }
    }

    this.logger.log(`Asunto seeder: ${inserted} registros insertados`);
    return { inserted };
  }
}
