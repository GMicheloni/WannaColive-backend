import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateUserDto } from './dto/user.dto';
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

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // 👇 Esto se ejecuta automáticamente al iniciar la app
  async onModuleInit() {
    const admins = [
      { email: 'juan@admin.com', password: '1234Admin' },
      { email: 'lali@admin.com', password: '1234Admin' },
      { email: 'fede@admin.com', password: '1234Admin' },
      { email: 'gian@admin.com', password: '1234Admin' },
    ];

    for (const admin of admins) {
      const existingAdmin = await this.userRepository.findOne({
        where: { email: admin.email },
      });

      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        const newAdmin = this.userRepository.create({
          email: admin.email,
          password: hashedPassword,
          nameandsurname: 'Administrador',
          role: Role.ADMIN,
          isActive: true,
          profileCompleted: true,
        });

        await this.userRepository.save(newAdmin);
        console.log(`✅ Admin creado: ${admin.email}`);
      } else {
        console.log(`⚠️ Admin ya existe: ${admin.email}`);
      }
    }

    console.log('✔️ Seed de administradores completado');
  }

  async createUser(body: CreateUserDto, userId: string) {
    const user = await this.userRepository.preload({
      id: userId,
      nameandsurname: body.nameandsurname,
      dni: body.dni,
      phone: body.phone,
      pais: { id: body.pais } as DeepPartial<Pais>,
      ciudad: { id: body.ciudad } as DeepPartial<Ciudad>,
      dateofbirth: body.dateofbirth,
      motivo: { id: body.motivoid } as DeepPartial<Motivo>,
      institucion: body.institucion,
      comonosconocio: {
        id: body.comonosconocioid,
      } as DeepPartial<Comonosconocio>,
      instagramuser: body.instagramuser || undefined,
      areadeestudio: body.areadeestudio || undefined,
      aboutme: body.aboutme || undefined,
      hobbies: (body.intereses ?? []).map((id: number) => ({ id })),
      profileCompleted: true,
    });

    const token = this.jwtService.sign({
      id: user!.id,
      role: user!.role,
      isActive: user!.isActive,
      profileCompleted: user!.profileCompleted,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.save(user);
    return { message: 'User updated successfully', newToken: token };
  }

  async getUsersWithoutActive() {
    const users = await this.userRepository.find({
      where: { isActive: false, role: Role.USER },
      select: ['email', 'nameandsurname', 'dni', 'phone'],
    });

    return users;
  }

  async darDeAlta(email: any) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    if (user.isActive) {
      return { message: 'User already active' };
    }

    user.isActive = true;
    await this.userRepository.save(user);

    return { message: 'User activated successfully' };
  }
}
