import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Anime } from './anime.entity';
import { User } from '../../user/user.entity'; // Ajuste o import do User

@Entity('comment')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'data_criacao' })
  data_criacao: Date;

  @ManyToOne(() => Anime, (anime) => anime.comments, { onDelete: 'CASCADE' })
  anime: Anime;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;
}