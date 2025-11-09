import { Controller, Get } from '@nestjs/common';
import { MotivoService } from './motivo.service';

@Controller('motivo')
export class MotivoController {
  constructor(private readonly motivoService: MotivoService) {}

  @Get()
  seederMotivos() {
    return this.motivoService.seederMotivos();
  }

  @Get('all')
  findAll() {
    return this.motivoService.findAll();
  }
}
