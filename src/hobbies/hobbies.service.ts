import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hobby } from './entities/hobby.entity';
import * as hobbiesData from '../hobbies.json';
import { CreateHobbyDto } from './dto/create-hobby.dto';
import { UpdateHobbyDto } from './dto/update-hobby.dto';

@Injectable()
export class HobbiesService implements OnModuleInit {
  private readonly logger = new Logger(HobbiesService.name);

  constructor(
    @InjectRepository(Hobby)
    private readonly hobbyRepository: Repository<Hobby>,
  ) {}

  async onModuleInit() {
    try {
      await this.seederHobbies();
    } catch (error) {
      this.logger.error(
        `Error en onModuleInit de HobbiesService: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async seederHobbies() {
    const data: Array<{ nombre?: string }> =
      (hobbiesData as any).default ?? (hobbiesData as any);

    if (!Array.isArray(data) || data.length === 0) {
      this.logger.warn('No hay datos en hobbies.json para sembrar');
      return { inserted: 0 };
    }

    let inserted = 0;
    for (const item of data) {
      const nombre = item?.nombre?.trim();
      if (!nombre) continue;

      const exists = await this.hobbyRepository.findOne({
        where: { nombre: nombre },
      });
      if (!exists) {
        const entity = this.hobbyRepository.create({ nombre: nombre });
        await this.hobbyRepository.save(entity);
        inserted++;
      }
    }

    this.logger.log(`Hobbies seeder: ${inserted} registros insertados`);
    return { inserted };
  }

  create(createHobbyDto: CreateHobbyDto) {
    return 'This action adds a new hobby';
  }

  async findAll() {
    try {
      return await this.hobbyRepository.find();
    } catch (error) {
      this.logger.error(
        `Error en findAll: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new Error('Error al obtener hobbies');
    }
  }

  async findOne(id: number) {
    try {
      if (!id || typeof id !== 'number') {
        throw new Error('Invalid hobby ID');
      }
      return await this.hobbyRepository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error(
        `Error en findOne: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new Error('Error al obtener hobby');
    }
  }

  update(id: number, updateHobbyDto: UpdateHobbyDto) {
    return `This action updates a #${id} hobby`;
  }

  remove(id: number) {
    return `This action removes a #${id} hobby`;
  }
}
