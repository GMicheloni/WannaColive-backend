import {
  BadRequestException,
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async signup(email: string, password: string) {
    try {
      if (!email || !password) {
        throw new BadRequestException('Email and password are required');
      }

      const findUser = await this.userRepository.findOne({ where: { email } });
      if (findUser) {
        throw new BadRequestException('User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = this.userRepository.create({
        email,
        password: hashedPassword,
      });
      await this.userRepository.save(newUser);
      this.logger.log(`Usuario registrado: ${email}`);
      return { message: 'User created successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `Error en signup: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException('Error al registrar el usuario');
    }
  }
  async signin(email: string, password: string) {
    try {
      if (!email || !password) {
        throw new BadRequestException('Email and password are required');
      }

      const user = await this.userRepository.findOne({ where: { email }, relations: ['casa'] });
      if (!user) {
        throw new BadRequestException('Invalid credentials');
      }

      if (!user.password) {
        throw new BadRequestException('Invalid credentials');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new BadRequestException('Invalid credentials');
      }

      const token = this.jwtService.sign({
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        role: user.role,
        isActive: user.isActive,
        profileCompleted: user.profileCompleted,
        casa: user.casa ? user.casa.nombre : null,
      });

      return token;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `Error en signin: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException('Error al iniciar sesión');
    }
  }
}
