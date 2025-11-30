import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Contrato, TipoHabitacion } from './entities/contrato.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Casa } from 'src/seeders/casa/entities/casa.entity';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { EmailService } from 'src/email/email.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ContratosService {
  private readonly logger = new Logger(ContratosService.name);

  constructor(
    @InjectRepository(Contrato)
    private readonly contratoRepository: Repository<Contrato>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Casa)
    private readonly casaRepository: Repository<Casa>,
    private readonly emailService: EmailService,
  ) {}

  async create(createContratoDto: CreateContratoDto) {
    try {
      // Buscar usuario por email
      const user = await this.userRepository.findOne({
        where: { email: createContratoDto.email },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Verificar si el usuario ya tiene un contrato activo (no eliminado)
      const existingContrato = await this.contratoRepository.findOne({
        where: { usuario: { id: user.id }, isDeleted: false },
      });

      if (existingContrato) {
        throw new BadRequestException('El usuario ya tiene un contrato activo');
      }

      // Verificar que la casa existe
      const casa = await this.casaRepository.findOne({
        where: { id: createContratoDto.casaId },
      });

      if (!casa) {
        throw new NotFoundException('Casa no encontrada');
      }

      // Crear el contrato
      const newContrato = this.contratoRepository.create({
        usuario: user,
        casa: casa,
        tipoHabitacion: createContratoDto.tipoHabitacion,
        nroHabitacion: createContratoDto.nroHabitacion,
        inicioContrato: new Date(createContratoDto.inicioContrato),
        finContrato: new Date(createContratoDto.finContrato),
        fechaFinalizacion: createContratoDto.fechaFinalizacion
          ? new Date(createContratoDto.fechaFinalizacion)
          : null,
      });

      const savedContrato = await this.contratoRepository.save(newContrato);

      // Actualizar el campo isActive del usuario a true
      user.isActive = true;
      user.casa = casa;
      await this.userRepository.save(user);

      this.logger.log(
        `Contrato creado para usuario ${createContratoDto.email} en casa ${casa.nombre}. Usuario activado.`,
      );

      // Enviar email de bienvenida con el template
      try {
        const emailHtml = this.loadEmailTemplate(savedContrato, casa, user);
        await this.emailService.sendEmail(
          user.email,
          '¡Tu usuario ha sido dado de alta! 🎉',
          emailHtml,
        );
        this.logger.log(`Email de bienvenida enviado a: ${user.email}`);
      } catch (emailError) {
        this.logger.error(
          `Error al enviar email de bienvenida a ${user.email}: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`,
        );
        // Continuar aunque falle el email - el contrato ya está creado
      }

      return {
        message: 'Contrato creado exitosamente',
        contrato: savedContrato,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Error en create: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException('Error al crear el contrato');
    }
  }

  async getByUserId(userId: string) {
    try {
      if (!userId) {
        throw new NotFoundException('User ID is required');
      }

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const contrato = await this.contratoRepository.findOne({
        where: { usuario: { id: userId }, isDeleted: false },
        relations: ['casa'],
      });

      if (!contrato) {
        throw new NotFoundException('El usuario no tiene un contrato');
      }

      return contrato;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error en getByUserId: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException('Error al obtener el contrato');
    }
  }

  async findAll() {
    try {
      const contratos = await this.contratoRepository.find({
        where: { isDeleted: false },
        relations: ['casa', 'usuario'],
      });

      return contratos.map((c) => ({
        id: c.id,
        casa: c.casa.nombre,
        usuario: c.usuario.nombre + ' ' + c.usuario.apellido,
        tipoHabitacion: c.tipoHabitacion,
        nroHabitacion: c.nroHabitacion,
        inicioContrato: c.inicioContrato,
        finContrato: c.finContrato,
        fechaFinalizacion: c.fechaFinalizacion,
        creadoEn: c.creadoEn,
        actualizadoEn: c.actualizadoEn,
      }));
    } catch (error) {
      this.logger.error(
        `Error en findAll: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException('Error al obtener los contratos');
    }
  }

  async update(id: string, updateContratoDto: UpdateContratoDto) {
    try {
      const contrato = await this.contratoRepository.findOne({
        where: { id, isDeleted: false },
        relations: ['casa'],
      });

      if (!contrato) {
        throw new NotFoundException('Contrato no encontrado');
      }

      // Si se actualiza la casa, verificar que existe
      if (updateContratoDto.casaId) {
        const casa = await this.casaRepository.findOne({
          where: { id: updateContratoDto.casaId },
        });

        if (!casa) {
          throw new NotFoundException('Casa no encontrada');
        }

        contrato.casa = casa;
      }

      // Actualizar los campos proporcionados
      if (updateContratoDto.tipoHabitacion !== undefined) {
        contrato.tipoHabitacion = updateContratoDto.tipoHabitacion;
      }

      if (updateContratoDto.nroHabitacion !== undefined) {
        contrato.nroHabitacion = updateContratoDto.nroHabitacion;
      }

      if (updateContratoDto.inicioContrato) {
        contrato.inicioContrato = new Date(updateContratoDto.inicioContrato);
      }

      if (updateContratoDto.finContrato) {
        contrato.finContrato = new Date(updateContratoDto.finContrato);
      }

      if (updateContratoDto.fechaFinalizacion !== undefined) {
        contrato.fechaFinalizacion = updateContratoDto.fechaFinalizacion
          ? new Date(updateContratoDto.fechaFinalizacion)
          : null;
      }

      const updatedContrato = await this.contratoRepository.save(contrato);
      this.logger.log(`Contrato actualizado: ${id}`);

      return {
        message: 'Contrato actualizado exitosamente',
        contrato: updatedContrato,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error en update: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException('Error al actualizar el contrato');
    }
  }

  async delete(id: string) {
    try {
      const contrato = await this.contratoRepository.findOne({
        where: { id, isDeleted: false },
        relations: ['usuario'],
      });

      if (!contrato) {
        throw new NotFoundException('Contrato no encontrado');
      }

      // Actualizar el usuario: desactivar y quitar la casa
      if (contrato.usuario) {
        contrato.usuario.isActive = false;
        contrato.usuario.casa = null;
        await this.userRepository.save(contrato.usuario);
      }

      // Soft delete: actualizar isDeleted a true en lugar de borrar físicamente
      contrato.isDeleted = true;
      await this.contratoRepository.save(contrato);
      this.logger.log(`Contrato marcado como eliminado (soft delete): ${id}`);

      return {
        message: 'Contrato eliminado exitosamente',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error en delete: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException('Error al eliminar el contrato');
    }
  }

  private loadEmailTemplate(
    contrato: Contrato,
    casa: Casa,
    usuario: User,
  ): string {
    try {
      // Intentar diferentes rutas según si estamos en desarrollo o producción
      const possiblePaths = [
        path.join(__dirname, '../../email/templates/Bienvenido.html'), // Desarrollo
        path.join(__dirname, '../../../src/email/templates/Bienvenido.html'), // Producción compilado
        path.join(process.cwd(), 'src/email/templates/Bienvenido.html'), // Ruta absoluta desde raíz
        path.join(process.cwd(), 'dist/src/email/templates/Bienvenido.html'), // Ruta absoluta compilado
      ];

      let templatePath: string | null = null;
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          templatePath = possiblePath;
          break;
        }
      }

      if (!templatePath) {
        throw new Error('No se pudo encontrar el template de email');
      }

      let template = fs.readFileSync(templatePath, 'utf-8');

      // Formatear tipo de habitación
      const tipoHabitacionFormateado =
        contrato.tipoHabitacion === TipoHabitacion.COMPARTIDA
          ? 'Compartida'
          : 'Privada';

      // Formatear fechas
      const formatDate = (date: Date): string => {
        return new Intl.DateTimeFormat('es-AR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(date);
      };

      // Obtener nombre del usuario o usar email si no tiene nombre
      const nombreUsuario = usuario.nombre || usuario.email.split('@')[0];

      // Reemplazar placeholders
      template = template.replace(/{{nombre}}/g, nombreUsuario);
      template = template.replace(/{{casa}}/g, casa.nombre);
      template = template.replace(
        /{{tipoHabitacion}}/g,
        tipoHabitacionFormateado,
      );
      template = template.replace(/{{nroHabitacion}}/g, contrato.nroHabitacion || 'N/A');
      template = template.replace(
        /{{inicioContrato}}/g,
        formatDate(contrato.inicioContrato),
      );
      template = template.replace(
        /{{finContrato}}/g,
        formatDate(contrato.finContrato),
      );

      return template;
    } catch (error) {
      this.logger.error(
        `Error al cargar el template de email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // Retornar un HTML simple como fallback
      return `
        <h1>¡Tu usuario ha sido dado de alta! 🎉</h1>
        <p>Hola ${usuario.nombre || usuario.email},</p>
        <p>¡Buenas noticias! Tu solicitud fue aprobada y ya tenés asignación dentro de WannaColive.</p>
        <p><strong>Casa:</strong> ${casa.nombre}</p>
        <p><strong>Tipo de habitación:</strong> ${contrato.tipoHabitacion === TipoHabitacion.COMPARTIDA ? 'Compartida' : 'Privada'}</p>
        <p><strong>N° habitación:</strong> ${contrato.nroHabitacion || 'N/A'}</p>
        <p>Ya podés ingresar a la app para ver tu perfil, tu casa y todas las funciones disponibles.</p>
      `;
    }
  }
}

