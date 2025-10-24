import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/user.dto';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post()
  createUser(@Body() body: CreateUserDto) {
    return this.usersService.createUser(body);
  }

  @Put(':id/admin')
  makeAdmin(@Param('id') id: string) {
    return this.usersService.makeAdmin(id);
  }
}
