import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { TipoHabitacion } from '../entities/contrato.entity';

export class CreateContratoDto {
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty({ message: 'La casa es obligatoria' })
  casaId: number;

  @IsEnum(TipoHabitacion, {
    message: 'El tipo de habitación debe ser "compartida" o "privada"',
  })
  @IsNotEmpty({ message: 'El tipo de habitación es obligatorio' })
  tipoHabitacion: TipoHabitacion;

  
  @IsString()
  @MaxLength(10)
  @IsNotEmpty({ message: 'El número de habitación es obligatorio' })
  nroHabitacion: string;

  @IsDateString({}, { message: 'La fecha de inicio del contrato debe ser válida' })
  @IsNotEmpty({ message: 'La fecha de inicio del contrato es obligatoria' })
  inicioContrato: string;

  @IsDateString({}, { message: 'La fecha de fin del contrato debe ser válida' })
  @IsNotEmpty({ message: 'La fecha de fin del contrato es obligatoria' })
  finContrato: string;

  @IsDateString({}, { message: 'La fecha de finalización debe ser válida' })
  @IsNotEmpty({ message: 'La fecha de finalización es obligatoria' })
  fechaFinalizacion: string;
}

