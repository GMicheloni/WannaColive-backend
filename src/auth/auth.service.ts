/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Credentials } from 'src/users/entities/credential.entity';
import { Repository } from 'typeorm';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Credentials)
    private userRepository: Repository<Credentials>,
    private readonly jwtService: JwtService,
  ) {}
  async signup(email: string, password: string) {
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
    return 'User created successfully';
  }
  async signin(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      profileCompleted: user.profileCompleted,
    });

    return token;
  }
}
