import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Role } from 'src/roles.enum';
import { Roles } from 'src/decorators/role.decorator';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}
  @Get()
  @Roles(Role.MODERATOR)
  @UseGuards(AuthGuard, RolesGuard)
  findAll() {
    return this.ticketsService.findAll();
  }
}
