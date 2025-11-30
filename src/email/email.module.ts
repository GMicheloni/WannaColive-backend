import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';

@Module({
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService], // Exportar para que otros módulos puedan usarlo
})
export class EmailModule {}
