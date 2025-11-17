import { Module } from '@nestjs/common';
import { ContratosService } from './contratos.service';
import { ContratosController } from './contratos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contrato } from './entities/contrato.entity';
import { User } from 'src/users/entities/user.entity';
import { Casa } from 'src/seeders/casa/entities/casa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contrato, User, Casa])],
  controllers: [ContratosController],
  providers: [ContratosService],
})
export class ContratosModule {}

