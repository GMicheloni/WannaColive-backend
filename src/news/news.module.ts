import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { News } from './entities/news.entity';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { Casa } from 'src/seeders/casa/entities/casa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([News, Casa])],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}

