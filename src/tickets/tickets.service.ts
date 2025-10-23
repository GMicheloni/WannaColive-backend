/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { EstadoTicket, Ticket } from './entities/ticket.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class TicketsService {
  @InjectRepository(Ticket)
  private ticketRepository: Repository<Ticket>;

  @InjectRepository(User)
  private userRepository: Repository<User>;

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
      asunto: { tipo: t.asunto.tipo }, // solo tipo
    }));
  }
  async create(asuntoId: number, descripcion: string, credentialId: string) {
    const usuario = await this.userRepository.findOne({
      where: {
        credentials: { id: credentialId },
      },
      relations: ['credentials'],
    });
    if (!usuario) throw new Error('Usuario no encontrado');
    const newTicket = this.ticketRepository.create({
      descripcion,
      usuario: { id: usuario.id },
      asunto: { id: asuntoId },
    });

    return this.ticketRepository.save(newTicket);
  }
  async getByUserId(credentialId: any) {
    const usuario = await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.credentials', 'credentials')
      .leftJoinAndSelect('user.tickets', 'ticket')
      .leftJoinAndSelect('ticket.asunto', 'asunto')
      .where('credentials.id = :credentialId', { credentialId })
      .getOne();

    if (!usuario) throw new Error('Usuario no encontrado');

    // Transformar los tickets
    const tickets = usuario.tickets.map((t) => ({
      descripcion: t.descripcion,
      creadoEn: t.creadoEn,
      actualizadoEn: t.actualizadoEn,
      estado: t.estado,
      asunto: { tipo: t.asunto.tipo },
      comentarioAdmin: t.comentarioAdmin,
    }));

    return tickets;
  }
  closeTicket(id: string, comentarioAdmin: string) {
    return this.ticketRepository.update(id, {
      estado: EstadoTicket.CERRADO,
      comentarioAdmin,
    });
  }
}
