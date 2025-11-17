import { Controller, Get } from '@nestjs/common';
import { CasaService } from './casa.service';

@Controller('casa')
export class CasaController {
  constructor(private readonly casaService: CasaService) {}

  @Get()
  seederCasas() {
    return this.casaService.seederCasas();
  }

  @Get('all')
  findAll() {
    return this.casaService.findAll();
  }
}

