import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';
import { DestinatarioEnum } from '../entities/news.entity';
import { Type } from 'class-transformer';

export class CreateNewsDto {
  @IsString()
  @IsNotEmpty({ message: 'El tipo de comunicado es obligatorio' })
  @MaxLength(100, { message: 'El tipo de comunicado no puede tener más de 100 caracteres' })
  tipodecomunicado: string;

  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(200, { message: 'El título no puede tener más de 200 caracteres' })
  titulo: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  descripcion: string;

  @IsEnum(DestinatarioEnum, { message: 'El destinatario debe ser "todos", "colivers" o "admin"' })
  @IsNotEmpty({ message: 'El destinatario es obligatorio' })
  destinatario: DestinatarioEnum;

  @IsArray()
  @ArrayMinSize(0) // permite []
  @IsInt({ each: true })
  @Type(() => Number)
  casas: number[];
}

