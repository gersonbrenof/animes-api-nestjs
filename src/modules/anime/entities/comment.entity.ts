import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../user/user.entity'; // Verifique se o caminho do User está correto

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  content!: string;

  // 👇 Agora isso é apenas um número guardando o ID do MyAnimeList!
  @Column({ type: 'int' })
  animeId!: number; 

  @ManyToOne(() => User, (user) => user.comments)
  user!: User;

  @CreateDateColumn()
  data_criacao!: Date;
}