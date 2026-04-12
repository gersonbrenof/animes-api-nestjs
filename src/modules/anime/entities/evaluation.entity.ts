import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../user/user.entity'; // Verifique se o caminho do User está correto

@Entity('evaluations')
export class Evaluation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  nota!: number; // Aqui vai a nota (ex: 1 a 5, ou 1 a 10)

  // 👇 ID do MyAnimeList
  @Column({ type: 'int' })
  animeId!: number; 

  @ManyToOne(() => User, (user) => user.evaluations)
  user!: User;

  @CreateDateColumn()
  data_criacao!: Date;
}