import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Casa } from 'src/seeders/casa/entities/casa.entity';

export enum DestinatarioEnum {
  TODOS = "todos",
  COLIVERS = "colivers",
  ADMIN = "administradores",
}


@Entity()
export class News {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  tipodecomunicado: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  titulo: string;

  @Column({ type: 'text', nullable: false })
  descripcion: string;

  @Column({
    type: "enum",
    enum: DestinatarioEnum,
    default: DestinatarioEnum.TODOS,
  })
  destinatario: DestinatarioEnum;

  @ManyToMany(() => Casa)
@JoinTable()
casas: Casa[];

 
  

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;
}

