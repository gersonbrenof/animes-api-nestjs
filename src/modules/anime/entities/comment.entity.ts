import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Anime } from './anime.entity';
import { User } from '../../user';

@Entity('comment') // Nome da tabela
export class Comment {
  @PrimaryGeneratedColumn()
  id: number; // ID automático  
  @Column({ type: 'text' })
  texto: string;

  @CreateDateColumn({ name: 'data_criacao' })
  data_criacao: Date;
  @Column({ type: 'text' })
  content: string;
  // Muitos comentários para um anime
  @ManyToOne(() => Anime, (anime) => anime.comments, { onDelete: 'CASCADE' })
  anime: Anime;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;
}