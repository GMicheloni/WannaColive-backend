import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private resend: Resend;

    constructor() {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            this.logger.warn('RESEND_API_KEY no está configurada. Los emails no se enviarán.');
        } else {
            this.resend = new Resend(apiKey);
        }
    }

    async sendEmail(to: string, subject: string, html: string) {
        try {
            if (!process.env.RESEND_API_KEY) {
                this.logger.error('RESEND_API_KEY no está configurada en las variables de entorno');
                throw new InternalServerErrorException('Configuración de email no disponible');
            }

            if (!this.resend) {
                this.resend = new Resend(process.env.RESEND_API_KEY);
            }

            this.logger.log(`Intentando enviar email a: ${to}`);
            
            // Obtener el email del remitente desde variables de entorno o usar el por defecto
            const fromEmail = process.env.RESEND_FROM_EMAIL || 'Soporte <onboarding@resend.dev>';
            
            this.logger.log(`Enviando desde: ${fromEmail}`);

            const result = await this.resend.emails.send({
                from: fromEmail,
                to,
                subject,
                html,
            });

            this.logger.log(`Email enviado exitosamente a: ${to}. ID: ${result.data?.id}`);
            
            return result;
        } catch (error) {
            this.logger.error(
                `Error al enviar email a ${to}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            this.logger.error(`Stack trace: ${error instanceof Error ? error.stack : 'No stack trace'}`);
            
            // No lanzar error para que el registro de usuario continúe
            // Solo loguear el error
            throw error;
        }
    }
}