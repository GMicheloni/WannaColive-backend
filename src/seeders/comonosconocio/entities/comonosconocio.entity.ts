import { User } from 'src/users/entities/user.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Comonosconocio {
  @PrimaryGeneratedColumn('increment')
  id: number;
  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  como: string;

  @OneToMany(() => User, (user) => user.motivo) usuarios: User[];
}
