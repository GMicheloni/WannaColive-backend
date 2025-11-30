/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Role } from 'src/roles.enum';
import { Roles } from 'src/decorators/role.decorator';
import { CreateTicketDto } from './dto/ticket.dto';
import { Request } from 'express';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}
  @Get('/all')
  @Roles(Role.MODERATOR, Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  findAll() {
    return this.ticketsService.findAll();
  }
  @Post()
  @Roles(Role.USER)
  @UseGuards(AuthGuard, RolesGuard)
  create(@Body() createTicketDto: CreateTicketDto, @Req() req) {
    if (!req || !req.user || !req.user.id) {
      throw new Error('User not authenticated');
    }
    if (!createTicketDto || !createTicketDto.asuntoId || !createTicketDto.descripcion) {
      throw new Error('AsuntoId and descripcion are required');
    }
    const userId = req.user.id;
    const { asuntoId, descripcion } = createTicketDto;
    return this.ticketsService.create(asuntoId, descripcion, userId);
  }

  @Get()
  @Roles(Role.USER)
  @UseGuards(AuthGuard, RolesGuard)
  async getMyTickets(@Req() req) {
    if (!req || !req.user || !req.user.id) {
      throw new Error('User not authenticated');
    }
    const userId = req.user.id;
    return await this.ticketsService.getByUserId(userId);
  }


  @Put('/:id/process')
  @Roles(Role.MODERATOR, Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  processTicket(@Param('id') id: string, @Body() body: any) {
    if (!id) {
      throw new Error('Ticket ID is required');
    }
    
    const { comentarioAdmin } = body;
    return this.ticketsService.processTicket(id, comentarioAdmin);
  }
  @Put('/:id/close')
  @Roles(Role.MODERATOR, Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  closeTicket(@Param('id') id: string, @Body() body: any) {
    if (!id) {
      throw new Error('Ticket ID is required');
    }
    if (!body || !body.comentarioAdmin) {
      throw new Error('Comentario admin is required');
    }
    const { comentarioAdmin } = body;
    return this.ticketsService.closeTicket(id, comentarioAdmin);
  }

  @Get('/:id/comentarios')
  @Roles(Role.USER, Role.ADMIN, Role.MODERATOR)
  @UseGuards(AuthGuard, RolesGuard)
  getComentarios(@Param('id') id: string, @Req() req) {
    if (!id) {
      throw new Error('Ticket ID is required');
    }
    if (!req || !req.user || !req.user.id) {
      throw new Error('User not authenticated');
    }
    const userId = req.user.id;
    return this.ticketsService.getComentariosByTicketId(id, userId);
  }
}
