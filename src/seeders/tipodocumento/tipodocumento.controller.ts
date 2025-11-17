import { Controller, Get } from '@nestjs/common';
import { TipoDocumentoService } from './tipodocumento.service';

@Controller('tipodocumento')
export class TipoDocumentoController {
  constructor(private readonly tipoDocumentoService: TipoDocumentoService) {}

  @Get('seeder')
  seeder() {
    return this.tipoDocumentoService.seeder();
  }

  @Get()
  findAll() {
    return this.tipoDocumentoService.findAll();
  }
}

