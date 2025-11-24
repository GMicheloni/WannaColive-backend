import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { News } from './entities/news.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateNewsDto } from './dto/create-news.dto';
import { Casa } from 'src/seeders/casa/entities/casa.entity';
import { Role } from 'src/roles.enum';
import { DestinatarioEnum } from './entities/news.entity';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
    @InjectRepository(Casa)
    private readonly casaRepository: Repository<Casa>,
  ) {}

  async create(createNewsDto: CreateNewsDto) {
    try {
      let casasToAssign: { id: number }[] = [];
  
      if (createNewsDto.casas.length === 0) {
        // 🔥 Obtener TODAS las casas si el array viene vacío
        const todasLasCasas = await this.casaRepository.find({
          select: ['id'],
        });
  
        casasToAssign = todasLasCasas.map((casa) => ({ id: casa.id }));
      } else {
        // Asignar solo las casas enviadas
        casasToAssign = createNewsDto.casas.map((id) => ({ id }));
      }
  
      const newNews = this.newsRepository.create({
        tipodecomunicado: createNewsDto.tipodecomunicado,
        titulo: createNewsDto.titulo,
        descripcion: createNewsDto.descripcion,
        destinatario: createNewsDto.destinatario,
        casas: casasToAssign, // ← siempre array, nunca null
      });
  
      const savedNews = await this.newsRepository.save(newNews);
  
      this.logger.log(`Noticia creada: ${savedNews.id}`);
  
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

  async getForMe(userRole: Role, casaNombre: string | null) {
    try {
      const allNews = await this.newsRepository.find({
        relations: ['casas'],
        order: { creadoEn: 'DESC' },
      });
  
      const filteredNews = allNews.filter((news) => {
  
        // ========== ADMIN / MODERATOR ==========
        if (userRole === Role.ADMIN || userRole === Role.MODERATOR) {
          const isForAdmin =
            news.destinatario === DestinatarioEnum.ADMIN ||
            news.destinatario === DestinatarioEnum.TODOS;
  
          if (!isForAdmin) return false;
  
          // 🔥 Admin solo ve las que sean de SU casa
          return news.casas.some((casa) => casa.nombre === casaNombre);
        }
  
        // ========== USER (coliver) ==========
        if (userRole === Role.USER) {
          const isForColivers =
            news.destinatario === DestinatarioEnum.COLIVERS ||
            news.destinatario === DestinatarioEnum.TODOS;
  
          if (!isForColivers) return false;
  
          return news.casas.some((casa) => casa.nombre === casaNombre);
        }
  
        return false;
      });
  
      return filteredNews;
  
    } catch (error) {
      this.logger.error(
        `Error en getForMe: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException('Error al obtener las noticias para el usuario');
    }
  }
  
}

