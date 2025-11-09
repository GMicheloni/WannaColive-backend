import { Module } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountriesController } from './countries.controller';
import { Ciudad } from 'src/cities/entities/ciudad.entity';
import { Pais } from './entities/pais.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Pais, Ciudad])],
  controllers: [CountriesController],
  providers: [CountriesService],
})
export class CountriesModule {}
