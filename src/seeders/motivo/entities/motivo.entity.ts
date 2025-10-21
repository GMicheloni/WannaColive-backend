import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Motivo {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  motivo: string;
}
