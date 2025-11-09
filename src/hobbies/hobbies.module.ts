import { Module } from '@nestjs/common';
import { HobbiesService } from './hobbies.service';
import { HobbiesController } from './hobbies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hobby } from './entities/hobby.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Hobby])],
  controllers: [HobbiesController],
  providers: [HobbiesService],
})
export class HobbiesModule {}
