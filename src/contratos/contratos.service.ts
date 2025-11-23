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

      // Verificar si el usuario ya tiene un contrato
      const existingContrato = await this.contratoRepository.findOne({
        where: { usuario: { id: user.id } },
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
        where: { usuario: { id: userId } },
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
        where: { id },
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
        where: { id },
        relations: ['usuario'],
      });

      if (!contrato) {
        throw new NotFoundException('Contrato no encontrado');
      }

      // Actualizar el usuario: desactivar y quitar la casa
      if (contrato.usuario) {
        contrato.usuario.isActive = false;
        contrato.usuario.casa = undefined as any;
        await this.userRepository.save(contrato.usuario);
      }

      await this.contratoRepository.remove(contrato);
      this.logger.log(`Contrato eliminado: ${id}`);

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
}

