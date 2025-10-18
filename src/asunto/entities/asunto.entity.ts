import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Asunto {
  @PrimaryGeneratedColumn('increment')
  id: number;
  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  tipo: string;
}
