import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Asunto } from 'src/seeders/asunto/entities/asunto.entity';
import { User } from 'src/users/entities/user.entity';
import { TicketComentario } from './ticketComentarios.entity';

export enum EstadoTicket {
  ABIERTO = 'Abierto',
  EN_PROCESO = 'En Proceso',
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
 

  @ManyToOne(() => Asunto)
  @JoinColumn()
  asunto: Asunto;
  @ManyToOne(() => User, (user) => user.tickets)
  usuario: User;

  @OneToMany(() => TicketComentario, (comentario) => comentario.ticket, {
    cascade: true,
  })
  comentarios: TicketComentario[];
  
}
