import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ciudad } from './entities/ciudad.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(Ciudad)
    private readonly ciudadRepository: Repository<Ciudad>,
  ) {}
  async getAllCitiesFromId(id: number) {
    try {
      if (!id || typeof id !== 'number') {
        throw new Error('Invalid country ID');
      }
      return await this.ciudadRepository.find({ where: { pais: { id } } });
    } catch (error) {
      throw new Error(
        `Error al obtener ciudades: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
