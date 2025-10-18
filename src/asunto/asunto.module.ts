import { Module } from '@nestjs/common';
import { AsuntoController } from './asunto.controller';
import { AsuntoService } from './asunto.service';

@Module({
  controllers: [AsuntoController],
  providers: [AsuntoService],
})
export class AsuntoModule {}
