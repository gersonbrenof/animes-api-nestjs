import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Anime } from './anime.entity';
import { User } from '../../user';

@Entity('evaluations')
export class Evaluation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 3, scale: 1 }) // Ex: 9.5
  rating: number;

  // Muitas avaliações pertencem a um Anime
  @ManyToOne(() => Anime, (anime) => anime.evaluations, { onDelete: 'CASCADE' })
  anime: Anime;

  @ManyToOne(() => User, (user) => user.evaluations)
  user: User;
}