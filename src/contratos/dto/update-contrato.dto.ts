import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { TipoHabitacion } from '../entities/contrato.entity';

export class UpdateContratoDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  casaId?: number;

  @IsOptional()
  @IsEnum(TipoHabitacion, {
    message: 'El tipo de habitación debe ser "compartida" o "privada"',
  })
  tipoHabitacion?: TipoHabitacion;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  nroHabitacion?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de inicio del contrato debe ser válida' })
  inicioContrato?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin del contrato debe ser válida' })
  finContrato?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de finalización debe ser válida' })
  fechaFinalizacion?: string;
}

