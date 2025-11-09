import { Ticket } from 'src/tickets/entities/ticket.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from 'src/roles.enum';
import { Hobby } from 'src/hobbies/entities/hobby.entity';
import { Ciudad } from 'src/cities/entities/ciudad.entity';
import { Pais } from 'src/countries/entities/pais.entity';
import { Comonosconocio } from 'src/seeders/comonosconocio/entities/comonosconocio.entity';
import { Motivo } from 'src/seeders/motivo/entities/motivo.entity';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  password: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ type: 'boolean', default: false })
  profileCompleted: boolean;
  @Column({ type: 'varchar', length: 100, nullable: true })
  nameandsurname: string;

  @Column({ type: 'varchar', length: 30, nullable: true, unique: true })
  dni: string;
  @Column({ type: 'varchar', length: 15, nullable: true })
  phone: string;

  @Column({ type: 'date', nullable: true })
  dateofbirth: Date;
  // reemplazado: motivoid:number;
  @ManyToOne(() => Motivo, (motivo) => motivo.usuarios, { nullable: true })
  @JoinColumn({ name: 'motivoid' })
  motivo: Motivo;

  @Column({ type: 'varchar', length: 100, nullable: true })
  institucion: string;
  @ManyToOne(() => Comonosconocio, (comonos) => comonos.usuarios, {
    nullable: true,
  })
  @JoinColumn({ name: 'comonosconocioid' })
  comonosconocio: Comonosconocio;

  @Column({ type: 'varchar', length: 30, nullable: true, default: null })
  instagramuser: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true, default: null })
  areadeestudio: string | null;
  @Column({ type: 'text', nullable: true, default: null })
  aboutme: string | null;

  @OneToMany(() => Ticket, (ticket) => ticket.usuario)
  tickets: Ticket[];

  @ManyToMany(() => Hobby)
  @JoinTable()
  hobbies: Hobby[];

  @ManyToOne(() => Pais, (pais) => pais.id)
  pais: Pais;

  @ManyToOne(() => Ciudad, (ciudad) => ciudad.id)
  ciudad: Ciudad;
}
