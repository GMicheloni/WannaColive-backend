import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto, UpdateProfileDto } from './dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, DeepPartial } from 'typeorm';
import { Ciudad } from 'src/cities/entities/ciudad.entity';
import { Pais } from 'src/countries/entities/pais.entity';
import { Motivo } from 'src/seeders/motivo/entities/motivo.entity';
import { Comonosconocio } from 'src/seeders/comonosconocio/entities/comonosconocio.entity';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/roles.enum';
import * as bcrypt from 'bcrypt';
import { TipoDocumento } from 'src/seeders/tipodocumento/entities/tipodocumento.entity';
import { Casa } from 'src/seeders/casa/entities/casa.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Casa)
    private readonly casaRepository: Repository<Casa>,
    private readonly jwtService: JwtService,
  ) {}

  // 👇 Esto se ejecuta automáticamente al iniciar la app
  async onModuleInit() {
    try {
      const admins = [
        { email: 'juan@admin.com', password: '1234Admin' },
        { email: 'lali@admin.com', password: '1234Admin' },
        { email: 'fede@admin.com', password: '1234Admin' },
        { email: 'gian@admin.com', password: '1234Admin' },
      ];

      for (const admin of admins) {
        try {
          const existingAdmin = await this.userRepository.findOne({
            where: { email: admin.email },
          });

          if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(admin.password, 10);
            const newAdmin = this.userRepository.create({
              email: admin.email,
              password: hashedPassword,
              nombre: 'Moderador',
              apellido: '',
              role: Role.MODERATOR,
              isActive: true,
              profileCompleted: true,
            });

            await this.userRepository.save(newAdmin);
            console.log(`✅ Admin creado: ${admin.email}`);
          } else {
            console.log(`⚠️ Admin ya existe: ${admin.email}`);
          }
        } catch (error) {
          this.logger.error(
            `Error al crear admin ${admin.email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }

      console.log('✔️ Seed de administradores completado');
    } catch (error) {
      this.logger.error(
        `Error en onModuleInit de UsersService: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async createUser(body: CreateUserDto, userId: string) {
    try {
      if (!userId) {
        throw new NotFoundException('User ID is required');
      }

      const existingUser = await this.userRepository.findOne({
        where: { id: userId },
        select: ['email'],
      });

      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      const user = await this.userRepository.preload({
        id: userId,
        nombre: body.nombre,
        apellido: body.apellido,
        tipoDocumento: body.tipoDocumento
          ? ({ id: body.tipoDocumento } as DeepPartial<TipoDocumento>)
          : undefined,
        dni: body.dni,
        phone: body.phone,
        pais: body.pais
          ? ({ id: body.pais } as DeepPartial<Pais>)
          : undefined,
        ciudad: body.ciudad
          ? ({ id: body.ciudad } as DeepPartial<Ciudad>)
          : undefined,
        dateofbirth: body.dateofbirth,
        motivo: body.motivoid
          ? ({ id: body.motivoid } as DeepPartial<Motivo>)
          : undefined,
        institucion: body.institucion,
        comonosconocio: body.comonosconocioid
          ? ({
              id: body.comonosconocioid,
            } as DeepPartial<Comonosconocio>)
          : undefined,
        instagramuser: body.instagramuser || undefined,
        areadeestudio: body.areadeestudio || undefined,
        aboutme: body.aboutme || undefined,
        hobbies: (body.intereses ?? []).map((id: number) => ({ id })),
        profileCompleted: true,
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const token = this.jwtService.sign({
        id: user.id,
        role: user.role,
        isActive: user.isActive,
        profileCompleted: user.profileCompleted,
      });

      await this.userRepository.save(user);
      this.logger.log(`Usuario completó su perfil: ${existingUser.email}`);
      return { message: 'User updated successfully', newToken: token };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error en createUser: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException('Error al actualizar el usuario');
    }
  }

  async getUsersWithoutActive() {
    try {
      const users = await this.userRepository.find({
        where: { isActive: false, role: Role.USER },
        select: ['email', 'nombre', 'apellido', 'dni', 'phone'],
      });

      return users;
    } catch (error) {
      this.logger.error(
        `Error en getUsersWithoutActive: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException(
        'Error al obtener usuarios inactivos',
      );
    }
  }

  

  async getAdmins() {
    try {
      const admins = await this.userRepository.find({
        where: { role: Role.ADMIN },
        select: [
          'id',
          'email',
        ],
        relations: ['casa'],
      });

      return admins;
    } catch (error) {
      this.logger.error(
        `Error en getAdmins: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException(
        'Error al obtener usuarios administradores',
      );
    }
  }

  async createAdmin(email: string, password: string, casaId: number) {
    try {
      // Verificar si el email ya existe
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        throw new NotFoundException('El email ya está registrado');
      }

      // Verificar que la casa existe
      const casa = await this.casaRepository.findOne({
        where: { id: casaId },
      });

      if (!casa) {
        throw new NotFoundException('La casa especificada no existe');
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear el administrador
      const newAdmin = this.userRepository.create({
        email,
        password: hashedPassword,
        nombre: 'Administrador',
        apellido: '',
        role: Role.ADMIN,
        isActive: true,
        profileCompleted: true,
        casa: { id: casaId } as DeepPartial<Casa>,
      });

      await this.userRepository.save(newAdmin);
      this.logger.log(`Administrador creado: ${email} para la casa ${casa.nombre}`);

      return {
        message: 'Administrador creado exitosamente',
        admin: {
          id: newAdmin.id,
          email: newAdmin.email,
          casa: {
            id: casa.id,
            nombre: casa.nombre,
          },
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error en createAdmin: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException('Error al crear el administrador');
    }
  }

  async deleteAdmin(adminId: string) {
    try {
      // Verificar que el administrador existe y es un ADMIN
      const admin = await this.userRepository.findOne({
        where: { id: adminId, role: Role.ADMIN },
      });

      if (!admin) {
        throw new NotFoundException('Administrador no encontrado');
      }

      // Eliminar el administrador
      await this.userRepository.remove(admin);
      this.logger.log(`Administrador eliminado: ${admin.email}`);

      return {
        message: 'Administrador eliminado exitosamente',
        deletedAdmin: {
          id: admin.id,
          email: admin.email,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error en deleteAdmin: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException('Error al eliminar el administrador');
    }
  }

  async getMe(userId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['motivo', 'comonosconocio', 'hobbies', 'tipoDocumento', 'pais', 'ciudad'],
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Retornar solo los campos necesarios sin incluir el password
      return {
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        dni: user.dni,
        phone: user.phone,
        dateofbirth: user.dateofbirth,
        institucion: user.institucion,
        instagramuser: user.instagramuser,
        areadeestudio: user.areadeestudio,
        aboutme: user.aboutme,
        motivo: user.motivo?.motivo,
        comonosconocio: user.comonosconocio?.como,
        hobbies: user.hobbies?.map((hobby) => hobby.nombre) || [],
        tipoDocumento: user.tipoDocumento?.tipo,
        pais: user.pais?.nombre,
        ciudad: user.ciudad?.nombre,
      };
    } catch (error) {
      this.logger.error(
        `Error en getMe: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException('Error al obtener el usuario');
    }
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    try {
      if (!userId) {
        throw new NotFoundException('User ID is required');
      }

      // Buscar el usuario
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Preparar el objeto de actualización
      const updateData: DeepPartial<User> = { id: userId };

      // Actualizar solo los campos que se proporcionaron
      if (updateProfileDto.nombre !== undefined) {
        updateData.nombre = updateProfileDto.nombre;
      }

      if (updateProfileDto.apellido !== undefined) {
        updateData.apellido = updateProfileDto.apellido;
      }

      if (updateProfileDto.dni !== undefined) {
        updateData.dni = updateProfileDto.dni;
      }

      if (updateProfileDto.phone !== undefined) {
        updateData.phone = updateProfileDto.phone;
      }

      if (updateProfileDto.dateofbirth !== undefined) {
        updateData.dateofbirth = new Date(updateProfileDto.dateofbirth);
      }

      if (updateProfileDto.institucion !== undefined) {
        updateData.institucion = updateProfileDto.institucion;
      }

      if (updateProfileDto.instagramuser !== undefined) {
        updateData.instagramuser = updateProfileDto.instagramuser || null;
      }

      if (updateProfileDto.areadeestudio !== undefined) {
        updateData.areadeestudio = updateProfileDto.areadeestudio || null;
      }

      if (updateProfileDto.aboutme !== undefined) {
        updateData.aboutme = updateProfileDto.aboutme || null;
      }

      // Actualizar relaciones si se proporcionaron
      if (updateProfileDto.tipoDocumento !== undefined) {
        updateData.tipoDocumento = {
          id: updateProfileDto.tipoDocumento,
        } as DeepPartial<TipoDocumento>;
      }

      if (updateProfileDto.pais !== undefined) {
        updateData.pais = { id: updateProfileDto.pais } as DeepPartial<Pais>;
      }

      if (updateProfileDto.ciudad !== undefined) {
        updateData.ciudad = {
          id: updateProfileDto.ciudad,
        } as DeepPartial<Ciudad>;
      }

      if (updateProfileDto.motivoid !== undefined) {
        updateData.motivo = {
          id: updateProfileDto.motivoid,
        } as DeepPartial<Motivo>;
      }

      if (updateProfileDto.comonosconocioid !== undefined) {
        updateData.comonosconocio = {
          id: updateProfileDto.comonosconocioid,
        } as DeepPartial<Comonosconocio>;
      }

      if (updateProfileDto.intereses !== undefined) {
        updateData.hobbies = updateProfileDto.intereses.map((id: number) => ({
          id,
        })) as DeepPartial<any>[];
      }

      // Cargar el usuario con preload y guardar
      const updatedUser = await this.userRepository.preload(updateData);

      if (!updatedUser) {
        throw new NotFoundException('Usuario no encontrado');
      }

      await this.userRepository.save(updatedUser);
      this.logger.log(`Perfil actualizado para usuario: ${userId}`);

      return {
        message: 'Perfil actualizado exitosamente',
        userId: updatedUser.id,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error en updateProfile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException('Error al actualizar el perfil');
    }
  }
}
