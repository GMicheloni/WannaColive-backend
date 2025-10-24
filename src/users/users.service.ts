import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, DeepPartial } from 'typeorm';
import { Credentials } from './entities/credential.entity';
import { Role } from 'src/roles.enum';

@Injectable()
export class UsersService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;
  @InjectRepository(Credentials)
  private readonly credentialsRepository: Repository<Credentials>;

  constructor() {}
  async createUser(body: CreateUserDto) {
    const credentialId = body.credencialId;
    const credential = await this.credentialsRepository.findOne({
      where: { id: credentialId },
    });
    if (!credential) {
      throw new Error('Credential not found');
    }
    const user = this.userRepository.create({
      nameandsurname: body.nameandsurname,
      dni: body.dni,
      phone: body.phone,
      pais: body.pais,
      ciudad: body.ciudad,
      dateofbirth: body.dateofbirth,
      motivoid: body.motivoid,
      asuntoid: body.asuntoid,
      institucion: body.institucion,
      comonosconocioid: body.comonosconocioid,
      credentials: credential, // aquí sí funciona
      instagramuser: body.instagramuser || null,
      intereses: body.intereses || null,
      areadeestudio: body.areadeestudio || null,
      aboutme: body.aboutme || null,
    } as DeepPartial<User>);

    await this.userRepository.save(user);
    return 'User created successfully';
  }
  async makeAdmin(id: string) {
    console.log(`usuario ascendido ${id}`);
    return await this.credentialsRepository.update(
      { id: id },
      { role: Role.ADMIN },
    );
  }
}
