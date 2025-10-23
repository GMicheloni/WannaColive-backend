import { Ticket } from 'src/tickets/entities/ticket.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Credentials } from './credential.entity';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  nameandsurname: string;

  @Column({ type: 'varchar', length: 30, nullable: false, unique: true })
  dni: string;
  @Column({ type: 'varchar', length: 15, nullable: false })
  phone: string;
  @Column({ type: 'varchar', length: 30, nullable: false })
  pais: string;
  @Column({ type: 'varchar', length: 30, nullable: false })
  ciudad: string;
  @Column({ type: 'date', nullable: false })
  dateofbirth: Date;
  @Column({ type: 'int', nullable: false })
  motivoid: number;
  @Column({ type: 'int', nullable: false })
  asuntoid: number;
  @Column({ type: 'varchar', length: 100, nullable: false })
  institucion: string;
  @Column({ type: 'int', nullable: false })
  comonosconocioid: number;
  @Column({ type: 'varchar', length: 30, nullable: true, default: null })
  instagramuser: string;
  @Column({ type: 'simple-array', nullable: true, default: null })
  intereses: string[];
  @Column({ type: 'varchar', length: 30, nullable: true, default: null })
  areadeestudio: string;
  @Column({ type: 'text', nullable: true, default: null })
  aboutme: string;

  @OneToMany(() => Ticket, (ticket) => ticket.usuario)
  tickets: Ticket[];

  @OneToOne(() => Credentials, (credentials) => credentials.user)
  @JoinColumn()
  credentials: Credentials;
}
