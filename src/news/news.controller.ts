import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
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
}

