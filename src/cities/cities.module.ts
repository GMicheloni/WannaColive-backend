import { Module } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { Ciudad } from './entities/ciudad.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Ciudad])],
  controllers: [CitiesController],
  providers: [CitiesService],
})
export class CitiesModule {}
