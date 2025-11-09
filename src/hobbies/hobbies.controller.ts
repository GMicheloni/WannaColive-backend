import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { HobbiesService } from './hobbies.service';
import { CreateHobbyDto } from './dto/create-hobby.dto';
import { UpdateHobbyDto } from './dto/update-hobby.dto';

@Controller('hobbies')
export class HobbiesController {
  constructor(private readonly hobbiesService: HobbiesService) {}

  @Post()
  create(@Body() createHobbyDto: CreateHobbyDto) {
    return this.hobbiesService.create(createHobbyDto);
  }

  @Get('all')
  findAll() {
    return this.hobbiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hobbiesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHobbyDto: UpdateHobbyDto) {
    return this.hobbiesService.update(+id, updateHobbyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hobbiesService.remove(+id);
  }
}
