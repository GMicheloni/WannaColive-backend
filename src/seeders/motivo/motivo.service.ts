/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// ...existing code...
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as motivosData from '../../motivo.json';
import { Motivo } from './entities/motivo.entity';
// ...existing code...

@Injectable()
export class MotivoService implements OnModuleInit {
  private readonly logger = new Logger(MotivoService.name);

  constructor(
    @InjectRepository(Motivo)
    private readonly motivoRepository: Repository<Motivo>,
  ) {}

  async onModuleInit() {
    await this.seederMotivos();
  }

  async seederMotivos() {
    const data: Array<{ id?: number; name?: string }> =
      (motivosData as any).default ?? (motivosData as any);
    if (!Array.isArray(data) || data.length === 0) {
      this.logger.warn('No hay datos en motivo.json para sembrar');
      return { inserted: 0 };
    }

    let inserted = 0;
    for (const item of data) {
      const nombre = item?.name?.trim();
      if (!nombre) continue;

      const exists = await this.motivoRepository.findOne({
        where: { motivo: nombre },
      });
      if (!exists) {
        const entity = this.motivoRepository.create({ motivo: nombre });
        await this.motivoRepository.save(entity);
        inserted++;
      }
    }

    this.logger.log(`Motivo seeder: ${inserted} registros insertados`);
    return { inserted };
  }
}
// ...existing code...s
