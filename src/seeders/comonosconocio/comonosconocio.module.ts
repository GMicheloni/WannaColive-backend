import { Module } from '@nestjs/common';
import { ComonosconocioService } from './comonosconocio.service';
import { ComonosconocioController } from './comonosconocio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comonosconocio } from './entities/comonosconocio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comonosconocio])],
  controllers: [ComonosconocioController],
  providers: [ComonosconocioService],
})
export class ComonosconocioModule {}
