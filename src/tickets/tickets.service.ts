import { Injectable } from '@nestjs/common';
import { Ticket } from './entities/ticket.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TicketsService {
  @InjectRepository(Ticket)
  private ticketRepository: Repository<Ticket>;

  constructor() {}
  findAll() {
    return this.ticketRepository.find();
  }
}
