import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('hobbies')
export class Hobby {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;
}
