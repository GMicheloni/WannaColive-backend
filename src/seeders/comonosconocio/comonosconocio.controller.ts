import { Controller, Get } from '@nestjs/common';
import { ComonosconocioService } from './comonosconocio.service';

@Controller('comonosconocio')
export class ComonosconocioController {
  constructor(private readonly comonosconocioService: ComonosconocioService) {}
  @Get()
  seeder() {
    return this.comonosconocioService.onModuleInit();
  }

  @Get('all')
  findAll() {
    return this.comonosconocioService.findAll();
  }
}
