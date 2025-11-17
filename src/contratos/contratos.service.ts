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
}

