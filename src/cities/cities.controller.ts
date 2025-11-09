import { Controller, Get, Param } from '@nestjs/common';
import { CitiesService } from './cities.service';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get(':id')
  getAllCitiesFromId(@Param('id') id: string) {
    return this.citiesService.getAllCitiesFromId(+id);
  }
}
