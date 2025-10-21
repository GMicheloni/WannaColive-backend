import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}
  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.ticketsService.findAll();
  }
}
