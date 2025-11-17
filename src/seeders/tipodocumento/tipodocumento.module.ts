import { Module } from '@nestjs/common';
import { TipoDocumentoController } from './tipodocumento.controller';
import { TipoDocumentoService } from './tipodocumento.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoDocumento } from './entities/tipodocumento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoDocumento])],
  controllers: [TipoDocumentoController],
  providers: [TipoDocumentoService],
})
export class TipoDocumentoModule {}

