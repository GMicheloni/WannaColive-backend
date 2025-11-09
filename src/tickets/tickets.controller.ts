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
    const userId = req.user.id;
    const { asuntoId, descripcion } = createTicketDto;
    return this.ticketsService.create(asuntoId, descripcion, userId);
  }

  @Get()
  @Roles(Role.USER)
  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  async getMyTickets(@Req() req) {
    const userId = req.user.id;
    return await this.ticketsService.getByUserId(userId);
  }

  @Put('/:id/close')
  @Roles(Role.MODERATOR, Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  closeTicket(@Param('id') id: string, @Body() body: any) {
    const { comentarioAdmin } = body;
    return this.ticketsService.closeTicket(id, comentarioAdmin);
  }
}
