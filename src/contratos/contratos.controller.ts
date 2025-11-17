import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ContratosService } from './contratos.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'src/roles.enum';

@Controller('contratos')
export class ContratosController {
  constructor(private readonly contratosService: ContratosService) {}

  @Post()
  @Roles(Role.MODERATOR, Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  create(@Body() createContratoDto: CreateContratoDto) {
    return this.contratosService.create(createContratoDto);
  }

  @Get('user/:id')
  @Roles(Role.USER)
  @UseGuards(AuthGuard, RolesGuard)
  getByUserId(@Param('id') id: string) {
    return this.contratosService.getByUserId(id);
  }
}

