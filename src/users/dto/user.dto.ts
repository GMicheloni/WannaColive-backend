import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MatchPassword } from 'src/helpers/matchPasswords';

export class CreateCredentialsDto {
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(32, {
    message: 'La contraseña no puede tener más de 32 caracteres',
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'La contraseña debe tener al menos una letra mayúscula',
  })
  @Matches(/(?=.*[a-z])/, {
    message: 'La contraseña debe tener al menos una letra minúscula',
  })
  @Matches(/(?=.*\d)/, {
    message: 'La contraseña debe tener al menos un número',
  })
  password: string;

  @IsString({
    message: 'La confirmación de contraseña debe ser una cadena de texto',
  })
  @IsNotEmpty({ message: 'La confirmación de contraseña es obligatoria' })
  @MatchPassword('password', { message: 'Las contraseñas no coinciden' })
  confirmPassword: string;
}

export class LoginUserDto {
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nameandsurname: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 30)
  dni: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 15)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  pais: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  ciudad: string;

  @IsDateString()
  @IsNotEmpty()
  dateofbirth: Date;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  motivoid: number;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  asuntoid: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  institucion: string;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  comonosconocioid: number;

  @IsString()
  @IsNotEmpty()
  credencialId: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  instagramuser?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  intereses?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(30)
  areadeestudio?: string;

  @IsOptional()
  @IsString()
  aboutme?: string;
}
