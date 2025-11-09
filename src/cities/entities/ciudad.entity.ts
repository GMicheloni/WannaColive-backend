// ciudad.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Pais } from 'src/countries/entities/pais.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('ciudades')
export class Ciudad {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @ManyToOne(() => Pais, (pais) => pais.ciudades, { onDelete: 'CASCADE' })
  pais: Pais;

  @OneToMany(() => User, (user) => user.ciudad)
  usuarios: User[];
}
