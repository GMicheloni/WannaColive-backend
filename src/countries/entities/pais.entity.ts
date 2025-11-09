// pais.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Ciudad } from 'src/cities/entities/ciudad.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('paises')
export class Pais {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @OneToMany(() => Ciudad, (ciudad) => ciudad.pais)
  ciudades: Ciudad[];

  @OneToMany(() => User, (user) => user.pais)
  usuarios: User[];
}
