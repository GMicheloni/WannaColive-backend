import { Module } from '@nestjs/common';
import { AsuntoController } from './asunto.controller';
import { AsuntoService } from './asunto.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asunto } from './entities/asunto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Asunto])],
  controllers: [AsuntoController],
  providers: [AsuntoService],
})
export class AsuntoModule {}
