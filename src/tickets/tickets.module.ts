import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketComentario } from './entities/ticketComentarios.entity';
import { User } from 'src/users/entities/user.entity';
import { Asunto } from 'src/seeders/asunto/entities/asunto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, TicketComentario, User, Asunto])],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
