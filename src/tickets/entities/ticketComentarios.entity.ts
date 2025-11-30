import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Ticket } from "./ticket.entity";

@Entity()
export class TicketComentario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  comentario: string;

  @CreateDateColumn()
  creadoEn: Date;

  @ManyToOne(() => Ticket, (ticket) => ticket.comentarios, { onDelete: 'CASCADE' })
  ticket: Ticket;
}
