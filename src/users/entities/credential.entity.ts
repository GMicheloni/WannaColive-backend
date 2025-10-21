import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Roles } from 'src/roles.enum';

@Entity()
export class Credentials {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  password: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'enum', enum: Roles, default: Roles.USER })
  role: Roles;

  @Column({ type: 'boolean', default: false })
  profileCompleted: boolean;

  @OneToOne(() => User, (user) => user.credentials)
  @JoinColumn()
  user: User;
}
