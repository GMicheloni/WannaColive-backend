/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EstadoTicket, Ticket } from './entities/ticket.entity';
import { TicketComentario } from './entities/ticketComentarios.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Asunto } from 'src/seeders/asunto/entities/asunto.entity';
import { Role } from 'src/roles.enum';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  @InjectRepository(Ticket)
  private ticketRepository: Repository<Ticket>;

  @InjectRepository(TicketComentario)
  private ticketComentarioRepository: Repository<TicketComentario>;

  @InjectRepository(User)
  private userRepository: Repository<User>;
  @InjectRepository(Asunto)
  private asuntoRepository: Repository<Asunto>;

  constructor() {}
  async findAll() {
    try {
      const tickets = await this.ticketRepository.find({
        relations: ['asunto', 'usuario', 'comentarios'],
        order: { creadoEn: 'DESC' },
      });

      return tickets.map((t) => ({
        id: t.id,
        descripcion: t.descripcion,
        creadoEn: t.creadoEn,
        actualizadoEn: t.actualizadoEn,
        estado: t.estado,
        asunto: t.asunto ? { tipo: t.asunto.tipo } : null,
        nameAndSurname: t.usuario?.nombre && t.usuario?.apellido 
          ? `${t.usuario.nombre} ${t.usuario.apellido}`.trim()
          : t.usuario?.nombre || t.usuario?.apellido || null,
        emailUser: t.usuario?.email,
        comentarios: t.comentarios
          ? t.comentarios
              .sort((a, b) => b.creadoEn.getTime() - a.creadoEn.getTime())
              .map((c) => ({
                id: c.id,
                comentario: c.comentario,
                creadoEn: c.creadoEn,
              }))
          : [],
      }));
    } catch (error) {
      this.logger.error(
        `Error en findAll: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException('Error al obtener los tickets');
    }
  }
  async create(asuntoId: number, descripcion: string, userId) {
    try {
      if (!userId) {
        throw new NotFoundException('User ID is required');
      }

      if (!asuntoId || typeof asuntoId !== 'number') {
        throw new NotFoundException('Asunto ID is required');
      }

      if (!descripcion || typeof descripcion !== 'string') {
        throw new NotFoundException('Descripción is required');
      }

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // validar asunto
      const asunto = await this.asuntoRepository.findOne({
        where: { id: asuntoId },
      });
      if (!asunto) {
        throw new NotFoundException('Asunto no encontrado');
      }

      const newTicket = this.ticketRepository.create({
        descripcion,
        asunto,
        usuario: user,
      });

      return await this.ticketRepository.save(newTicket);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error en create: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException('Error al crear el ticket');
    }
  }
  async getByUserId(userId: any) {
    try {
      if (!userId) {
        throw new NotFoundException('User ID is required');
      }

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const tickets = await this.ticketRepository
        .createQueryBuilder('ticket')
        .leftJoinAndSelect('ticket.asunto', 'asunto')
        .leftJoinAndSelect('ticket.comentarios', 'comentarios')
        .where('ticket.usuarioId = :userId OR ticket.usuarioId = :userId', {
          userId,
        })
        // si la columna FK en la BD se llama diferente, TypeORM mapea JoinColumn name; alternativa:
        // .where('ticket.usuarioId = :userId', { userId })
        .orderBy('ticket.creadoEn', 'DESC')
        .addOrderBy('comentarios.creadoEn', 'DESC')
        .getMany();

      return tickets.map((t) => ({
        id: t.id,
        descripcion: t.descripcion,
        creadoEn: t.creadoEn,
        actualizadoEn: t.actualizadoEn,
        estado: t.estado,
        asunto: t.asunto ? { id: t.asunto.id, tipo: t.asunto.tipo } : null,
        comentarios: t.comentarios
          ? t.comentarios
              .sort((a, b) => b.creadoEn.getTime() - a.creadoEn.getTime())
              .map((c) => ({
                id: c.id,
                comentario: c.comentario,
                creadoEn: c.creadoEn,
              }))
          : [],
      }));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error en getByUserId: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException('Error al obtener los tickets');
    }
  }
  async closeTicket(id: string, comentarioAdmin: string) {
    try {
      if (!id || typeof id !== 'string') {
        throw new NotFoundException('Ticket ID is required');
      }

      if (!comentarioAdmin || typeof comentarioAdmin !== 'string') {
        throw new NotFoundException('Comentario admin is required');
      }

      // Buscar el ticket
      const ticket = await this.ticketRepository.findOne({
        where: { id },
      });

      if (!ticket) {
        throw new NotFoundException('Ticket no encontrado');
      }

      // Crear el comentario
      const nuevoComentario = this.ticketComentarioRepository.create({
        comentario: comentarioAdmin,
        ticket: ticket,
      });

      await this.ticketComentarioRepository.save(nuevoComentario);

      // Actualizar el estado del ticket
      const result = await this.ticketRepository.update(id, {
        estado: EstadoTicket.CERRADO,
      });

      if (result.affected === 0) {
        throw new NotFoundException('Ticket no encontrado');
      }

      return {
        message: 'Ticket cerrado exitosamente',
        comentario: nuevoComentario,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error en closeTicket: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException('Error al cerrar el ticket');
    }
  }
  async processTicket(id: string, comentarioAdmin: string) {
    try {
      if (!id || typeof id !== 'string') {
        throw new NotFoundException('Ticket ID is required');
      }

      if (!comentarioAdmin || typeof comentarioAdmin !== 'string') {
        throw new NotFoundException('Comentario admin is required');
      }

      // Buscar el ticket
      const ticket = await this.ticketRepository.findOne({
        where: { id },
      });

      if (!ticket) {
        throw new NotFoundException('Ticket no encontrado');
      }

      // Crear el comentario
      const nuevoComentario = this.ticketComentarioRepository.create({
        comentario: comentarioAdmin,
        ticket: ticket,
      });

      await this.ticketComentarioRepository.save(nuevoComentario);

      // Actualizar el estado del ticket
      const result = await this.ticketRepository.update(id, {
        estado: EstadoTicket.EN_PROCESO,
      });

      if (result.affected === 0) {
        throw new NotFoundException('Ticket no encontrado');
      }

      return {
        message: 'Ticket procesado correctamente',
        comentario: nuevoComentario,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error en processTicket: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException('Error al procesar el ticket');
    }
  }

  async getComentariosByTicketId(ticketId: string, userId?: string) {
    try {
      if (!ticketId || typeof ticketId !== 'string') {
        throw new NotFoundException('Ticket ID is required');
      }

      // Buscar el ticket con sus comentarios
      const ticket = await this.ticketRepository.findOne({
        where: { id: ticketId },
        relations: ['comentarios', 'usuario'],
      });

      if (!ticket) {
        throw new NotFoundException('Ticket no encontrado');
      }

      // Si el usuario es USER, verificar que sea el dueño del ticket
      if (userId) {
        const user = await this.userRepository.findOne({
          where: { id: userId },
          select: ['id', 'role'],
        });

        if (user && user.role === Role.USER && ticket.usuario?.id !== userId) {
          throw new NotFoundException('Ticket no encontrado');
        }
      }

      // Ordenar comentarios por fecha (más recientes primero)
      const comentarios = ticket.comentarios
        ? ticket.comentarios
            .sort((a, b) => b.creadoEn.getTime() - a.creadoEn.getTime())
            .map((c) => ({
              comentario: c.comentario,
              creadoEn: c.creadoEn,
            }))
        : [];

      return {
        comentarios: comentarios,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error en getComentariosByTicketId: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException('Error al obtener los comentarios del ticket');
    }
  }
}
