import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { News } from './entities/news.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateNewsDto } from './dto/create-news.dto';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
  ) {}

  async create(createNewsDto: CreateNewsDto) {
    try {
      const newNews = this.newsRepository.create({
        tipodecomunicado: createNewsDto.tipodecomunicado,
        titulo: createNewsDto.titulo,
        descripcion: createNewsDto.descripcion,
      });

      const savedNews = await this.newsRepository.save(newNews);
      this.logger.log(`Noticia creada: ${savedNews.titulo}`);

      return {
        message: 'Noticia creada exitosamente',
        news: savedNews,
      };
    } catch (error) {
      this.logger.error(
        `Error en create: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException('Error al crear la noticia');
    }
  }

  async findAll() {
    try {
      const news = await this.newsRepository.find({
        order: { creadoEn: 'DESC' },
      });

      return news;
    } catch (error) {
      this.logger.error(
        `Error en findAll: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException('Error al obtener las noticias');
    }
  }
}

