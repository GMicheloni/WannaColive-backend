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
    const credentialId = req.user.id;
    const { asuntoId, descripcion } = createTicketDto;
    return this.ticketsService.create(asuntoId, descripcion, credentialId);
  }

  @Get()
  @Roles(Role.USER)
  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  async getMyTickets(@Req() req) {
    const credentialId = req.user.id; // userId extraído del JWT (usualmente con JwtAuthGuard)
    console.log('User ID from JWT:', credentialId);
    return await this.ticketsService.getByUserId(credentialId);
  }

  @Put('/:id/close')
  @Roles(Role.MODERATOR, Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  closeTicket(@Param('id') id: string, @Body() body: any) {
    const { comentarioAdmin } = body;
    return this.ticketsService.closeTicket(id, comentarioAdmin);
  }
}
