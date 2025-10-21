/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { InjectRepository } from '@nestjs/typeorm';
import { Asunto } from './entities/asunto.entity';
import { Repository } from 'typeorm';
import * as asuntodata from '../../asunto.json';
export class AsuntoService {
  constructor(
    @InjectRepository(Asunto)
    private readonly asuntoRepository: Repository<Asunto>,
  ) {}
  async seeder() {
    const data: Array<{ tipo: string }> =
      (asuntodata as any).default ?? (asuntodata as any);
    if (!Array.isArray(data) || data.length === 0) {
      return { inserted: 0 };
    }

    for (const item of data) {
      if (!item?.tipo) continue;
      const exists = await this.asuntoRepository.findOne({
        where: { tipo: item.tipo },
      });
      if (!exists) {
        const entity = this.asuntoRepository.create({ tipo: item.tipo });
        await this.asuntoRepository.save(entity);
      }
    }

    return 'Asunto seeder completado';
  }
}
