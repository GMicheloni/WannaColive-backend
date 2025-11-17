import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TipoDocumento } from './entities/tipodocumento.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TipoDocumentoService implements OnModuleInit {
  private readonly logger = new Logger(TipoDocumentoService.name);

  constructor(
    @InjectRepository(TipoDocumento)
    private readonly tipoDocumentoRepository: Repository<TipoDocumento>,
  ) {}

  async onModuleInit() {
    try {
      await this.seeder();
    } catch (error) {
      this.logger.error(
        `Error en onModuleInit de TipoDocumentoService: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async seeder() {
    const tiposDocumento = ['DNI', 'Pasaporte', 'ID Card'];

    let inserted = 0;
    for (const tipo of tiposDocumento) {
      const exists = await this.tipoDocumentoRepository.findOne({
        where: { tipo },
      });
      if (!exists) {
        const entity = this.tipoDocumentoRepository.create({ tipo });
        await this.tipoDocumentoRepository.save(entity);
        inserted++;
      }
    }

    this.logger.log(`TipoDocumento seeder: ${inserted} registros insertados`);
    return { inserted };
  }

  findAll() {
    return this.tipoDocumentoRepository.find();
  }
}

