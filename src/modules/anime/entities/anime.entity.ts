import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Comment } from './comment.entity';
import { Evaluation } from './evaluation.entity';

@Entity('anime') // Nome da tabela
export class Anime {
  @PrimaryGeneratedColumn()
  id: number; // ID automático

  @Column({ length: 100 })
  titulo: string;

  @Column({ type: 'text' })
  descricao: string;

  @Column({ length: 50 })
  genero: string;

  @Column({ nullable: true })
  foto: string; // URL ou caminho da imagem

  @Column({ type: 'int', nullable: true })
  data_lancamento: number; // Ano de lançamento

  @OneToMany(() => Comment, (comment) => comment.anime)
  comments: Comment[];

  // Um anime pode ter muitas avaliações
  @OneToMany(() => Evaluation, (evaluation) => evaluation.anime)
  evaluations: Evaluation[];
}