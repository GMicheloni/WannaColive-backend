import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { News } from './entities/news.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateNewsDto } from './dto/create-news.dto';
import { Casa } from 'src/seeders/casa/entities/casa.entity';
import { User } from 'src/users/entities/user.entity';
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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createNewsDto: CreateNewsDto) {
    try {
      let casasToAssign: { id: number }[] = [];
      let usuarioDestino: User | null = null;

      // Validar que si destinatario es USUARIO, debe venir usuarioDestino
      if (
        createNewsDto.destinatario === DestinatarioEnum.USUARIO &&
        !createNewsDto.usuarioDestino
      ) {
        throw new BadRequestException(
          'El campo usuarioDestino es obligatorio cuando destinatario es "usuario"',
        );
      }

      // Si viene usuarioDestino, buscar el usuario por email
      if (createNewsDto.usuarioDestino) {
        // Validar que solo se use con destinatario USUARIO
        if (createNewsDto.destinatario !== DestinatarioEnum.USUARIO) {
          throw new BadRequestException(
            'El campo usuarioDestino solo puede usarse cuando destinatario es "usuario"',
          );
        }

        usuarioDestino = await this.userRepository.findOne({
          where: { email: createNewsDto.usuarioDestino },
        });

        if (!usuarioDestino) {
          throw new NotFoundException(
            `Usuario con email ${createNewsDto.usuarioDestino} no encontrado`,
          );
        }

        // Si destinatario es USUARIO y viene usuarioDestino, no asignar casas
        casasToAssign = [];
      } else {
        // Lógica normal de casas cuando no hay usuarioDestino
        if (!createNewsDto.casas || createNewsDto.casas.length === 0) {
          // 🔥 Obtener TODAS las casas si el array viene vacío
          const todasLasCasas = await this.casaRepository.find({
            select: ['id'],
          });

          casasToAssign = todasLasCasas.map((casa) => ({ id: casa.id }));
        } else {
          // Asignar solo las casas enviadas
          casasToAssign = createNewsDto.casas.map((id) => ({ id }));
        }
      }

      const newNews = this.newsRepository.create({
        tipodecomunicado: createNewsDto.tipodecomunicado,
        titulo: createNewsDto.titulo,
        descripcion: createNewsDto.descripcion,
        destinatario: createNewsDto.destinatario,
        casas: casasToAssign,
        usuarioDestino: usuarioDestino || undefined,
      });

      const savedNews = await this.newsRepository.save(newNews);

      this.logger.log(`Noticia creada: ${savedNews.id}`);

      return {
        message: 'Noticia creada exitosamente',
        news: savedNews,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
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

  async getForMe(
    userRole: Role,
    casaNombre: string | null,
    userId: string,
  ) {
    try {
      const allNews = await this.newsRepository.find({
        relations: ['casas', 'usuarioDestino'],
        order: { creadoEn: 'DESC' },
      });

      const filteredNews = allNews.filter((news) => {
        // ========== Noticias con usuarioDestino (personales) ==========
        if (news.destinatario === DestinatarioEnum.USUARIO) {
          // Solo mostrar si el usuarioDestino coincide con el usuario autenticado
          if (news.usuarioDestino && news.usuarioDestino.id === userId) {
            return true;
          }
          return false;
        }

        // ========== MODERATOR ==========
        if (userRole === Role.MODERATOR) {
          // Moderator ve todas las noticias para ADMIN o TODOS, sin filtrar por casa
          return (
            news.destinatario === DestinatarioEnum.ADMIN ||
            news.destinatario === DestinatarioEnum.TODOS
          );
        }

        // ========== ADMIN ==========
        if (userRole === Role.ADMIN) {
          const isForAdmin =
            news.destinatario === DestinatarioEnum.ADMIN ||
            news.destinatario === DestinatarioEnum.TODOS;

          if (!isForAdmin) return false;

          // Admin solo ve las que sean de SU casa
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
      throw new InternalServerErrorException(
        'Error al obtener las noticias para el usuario',
      );
    }
  }
  
}

