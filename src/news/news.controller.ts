import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'src/roles.enum';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @Roles(Role.MODERATOR, Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  create(@Body() createNewsDto: CreateNewsDto) {
    return this.newsService.create(createNewsDto);
  }

  @Get()
  @Roles(Role.USER)
  @UseGuards(AuthGuard, RolesGuard)
  findAll() {
    return this.newsService.findAll();
  }

  @Get('forme')
  @Roles(Role.USER, Role.ADMIN, Role.MODERATOR)
  @UseGuards(AuthGuard, RolesGuard)
  getForMe(@Req() req) {
    if (!req || !req.user || !req.user.role || !req.user.id) {
      throw new Error('User not authenticated');
    }
    const userRole = req.user.role;
    const casaNombre = req.user.casa || null;
    const userId = req.user.id;
    return this.newsService.getForMe(userRole, casaNombre, userId);
  }
}

