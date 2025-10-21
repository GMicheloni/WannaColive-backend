import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MatchPassword } from 'src/helpers/matchPasswords';

export class CreateUserDto {
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
