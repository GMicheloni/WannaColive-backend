import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Contrato } from 'src/contratos/entities/contrato.entity';

@Entity()
export class Casa {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  nombre: string;

  @OneToMany(() => User, (user) => user.casa)
  usuarios: User[];

  @OneToMany(() => Contrato, (contrato) => contrato.casa)
  contratos: Contrato[];
}

