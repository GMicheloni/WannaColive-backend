import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
    return { message: 'User created successfully' };
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
      role: user.role,
      isActive: user.isActive,
      profileCompleted: user.profileCompleted,
    });

    return token;
  }
}
