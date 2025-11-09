import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async createUser(body: CreateUserDto, userId: string) {
    const user = await this.userRepository.preload({
      id: userId, // 🔹 Este campo le dice a TypeORM qué usuario actualizar
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
/* async makeAdmin(id: string) {
    console.log(`usuario ascendido ${id}`);
    return await this.credentialsRepository.update(
      { id: id },
      { role: Role.ADMIN },
    );
  } */
