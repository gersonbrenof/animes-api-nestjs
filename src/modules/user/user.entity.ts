import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Comment } from '../anime/entities/comment.entity'; // Ajuste o caminho se necessário
import { Evaluation } from '../anime/entities/evaluation.entity'; // Ajuste o caminho se necessário

// Se você não tiver o Enum no arquivo, certifique-se de mantê-lo
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  // 👇 Nova coluna de NOME adicionada
  @Column()
  nome!: string; 

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  // SQLite não suporta enum nativamente, usamos text
  @Column({ type: 'text', default: UserRole.USER })
  role!: UserRole;

  // 👇 Trocamos o 'any' pelas relações reais com os Comentários e Avaliações
  @OneToMany(() => Evaluation, (evaluation) => evaluation.user)
  evaluations!: Evaluation[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[];
}