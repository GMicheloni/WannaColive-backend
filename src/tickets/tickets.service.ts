/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { EstadoTicket, Ticket } from './entities/ticket.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Asunto } from 'src/seeders/asunto/entities/asunto.entity';

@Injectable()
export class TicketsService {
  @InjectRepository(Ticket)
  private ticketRepository: Repository<Ticket>;

  @InjectRepository(User)
  private userRepository: Repository<User>;
  @InjectRepository(Asunto)
  private asuntoRepository: Repository<Asunto>;

  constructor() {}
  async findAll() {
    const tickets = await this.ticketRepository.find({
      relations: ['asunto', 'usuario'],
    });

    return tickets.map((t) => ({
      id: t.id,
      descripcion: t.descripcion,
      creadoEn: t.creadoEn,
      actualizadoEn: t.actualizadoEn,
      estado: t.estado,
      asunto: { tipo: t.asunto.tipo },
      nameAndSurname: t.usuario?.nameandsurname,
      emailUser: t.usuario?.email,
      comentAdmin: t.comentarioAdmin,
    }));
  }
  async create(asuntoId: number, descripcion: string, userId) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // validar asunto
    const asunto = await this.asuntoRepository.findOne({
      where: { id: asuntoId },
    });
    if (!asunto) throw new NotFoundException('Asunto no encontrado');

    const newTicket = this.ticketRepository.create({
      descripcion,
      asunto,
      usuario: user,
    });

    return this.ticketRepository.save(newTicket);
  }
  async getByUserId(userId: any) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const tickets = await this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.asunto', 'asunto')
      .where('ticket.usuarioId = :userId OR ticket.usuarioId = :userId', {
        userId,
      })
      // si la columna FK en la BD se llama diferente, TypeORM mapea JoinColumn name; alternativa:
      // .where('ticket.usuarioId = :userId', { userId })
      .orderBy('ticket.creadoEn', 'DESC')
      .getMany();

    return tickets.map((t) => ({
      id: t.id,
      descripcion: t.descripcion,
      creadoEn: t.creadoEn,
      actualizadoEn: t.actualizadoEn,
      estado: t.estado,
      asunto: t.asunto ? { id: t.asunto.id, tipo: t.asunto.tipo } : null,
      comentarioAdmin: t.comentarioAdmin,
    }));
  }
  closeTicket(id: string, comentarioAdmin: string) {
    return this.ticketRepository.update(id, {
      estado: EstadoTicket.CERRADO,
      comentarioAdmin,
    });
  }
}
