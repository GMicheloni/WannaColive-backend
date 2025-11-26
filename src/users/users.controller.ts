/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, CreateAdminDto, UpdateProfileDto } from './dto/user.dto';
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
    if (!req || !req.user || !req.user.id) {
      throw new Error('User not authenticated');
    }
    return this.usersService.createUser(body, req.user.id);
  }

  @Get('inactives')
  @Roles(Role.ADMIN, Role.MODERATOR)
  @UseGuards(AuthGuard)
  getUsersWithoutActive() {
    return this.usersService.getUsersWithoutActive();
  }
  

  @Get('admins')
  @Roles(Role.MODERATOR)
  @UseGuards(AuthGuard, RolesGuard)
  getAdmins() {
    return this.usersService.getAdmins();
  }

  @Post('admin')
  @Roles(Role.MODERATOR)
  @UseGuards(AuthGuard, RolesGuard)
  createAdmin(@Body() body: CreateAdminDto) {
    return this.usersService.createAdmin(body.email, body.password, body.casa);
  }

  @Delete('admin/:id')
  @Roles(Role.MODERATOR)
  @UseGuards(AuthGuard, RolesGuard)
  deleteAdmin(@Param('id') id: string) {
    return this.usersService.deleteAdmin(id);
  }

  @Get("/me")
  @Roles(Role.USER)
  @UseGuards(AuthGuard, RolesGuard)
  getMe(@Req() req) {
    return this.usersService.getMe(req.user.id);
  }

  @Patch("/profile")
  @Roles(Role.USER)
  @UseGuards(AuthGuard, RolesGuard)
  updateProfile(@Body() body: UpdateProfileDto, @Req() req) {
    if (!req || !req.user || !req.user.id) {
      throw new Error('User not authenticated');
    }
    return this.usersService.updateProfile(req.user.id, body);
  }
}
