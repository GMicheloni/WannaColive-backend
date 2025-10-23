import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Asunto } from 'src/seeders/asunto/entities/asunto.entity';
import { User } from 'src/users/entities/user.entity';

export enum EstadoTicket {
  ABIERTO = 'Abierto',
  CERRADO = 'Cerrado',
}
@Entity()
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  descripcion: string;
  @CreateDateColumn()
  creadoEn: Date;
  @UpdateDateColumn()
  actualizadoEn: Date;
  @Column({
    type: 'enum',
    enum: EstadoTicket,
    default: EstadoTicket.ABIERTO,
  })
  estado: EstadoTicket;
  @Column('text', { nullable: true })
  comentarioAdmin: string;

  @ManyToOne(() => Asunto)
  @JoinColumn()
  asunto: Asunto;
  @ManyToOne(() => User, (user) => user.tickets)
  usuario: User;
}
