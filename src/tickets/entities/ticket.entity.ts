import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Asunto } from 'src/asunto/entities/asunto.entity';

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

  @OneToOne(() => Asunto)
  @JoinColumn()
  asunto: Asunto;
}
