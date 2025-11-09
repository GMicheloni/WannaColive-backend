import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/user.dto';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'src/roles.enum';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Patch()
  @Roles(Role.USER)
  @UseGuards(AuthGuard, RolesGuard)
  createUser(@Body() body: CreateUserDto, @Req() req) {
    return this.usersService.createUser(body, req.user.id);
  }

  @Put(':id/admin')
  makeAdmin(@Param('id') id: string) {
    /* return this.usersService.makeAdmin(id); */
  }
}
