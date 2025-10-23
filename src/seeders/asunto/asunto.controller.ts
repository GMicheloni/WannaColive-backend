import { Controller, Get } from '@nestjs/common';
import { AsuntoService } from './asunto.service';

@Controller('asunto')
export class AsuntoController {
  constructor(private readonly asuntoService: AsuntoService) {}
  @Get('seeder')
  seeder() {
    return this.asuntoService.seeder();
  }

  @Get()
  findAll() {
    return this.asuntoService.findAll();
  }
}
