import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Casa } from 'src/seeders/casa/entities/casa.entity';

export enum TipoHabitacion {
  COMPARTIDA = 'compartida',
  PRIVADA = 'privada',
}

@Entity()
export class Contrato {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.contratos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuarioid' })
  usuario: User;

  @ManyToOne(() => Casa, (casa) => casa.contratos)
  @JoinColumn({ name: 'casaid' })
  casa: Casa;

  @Column({
    type: 'enum',
    enum: TipoHabitacion,
    nullable: false,
  })
  tipoHabitacion: TipoHabitacion;

  @Column({ type: 'varchar', length: 10, nullable: true })
  nroHabitacion: string;

  @Column({ type: 'date', nullable: false })
  inicioContrato: Date;

  @Column({ type: 'date', nullable: false })
  finContrato: Date;

  @Column({ type: 'date', nullable: true })
  fechaFinalizacion: Date | null;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;

  @Column({ default: false })
  isDeleted: boolean;
}

