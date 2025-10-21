import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Comonosconocio {
  @PrimaryGeneratedColumn('increment')
  id: number;
  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  como: string;
}
