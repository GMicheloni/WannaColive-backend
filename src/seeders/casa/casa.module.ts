import { Module } from '@nestjs/common';
import { CasaService } from './casa.service';
import { CasaController } from './casa.controller';

import { Casa } from './entities/casa.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Casa])],
  controllers: [CasaController],
  providers: [CasaService],
})
export class CasaModule {}

