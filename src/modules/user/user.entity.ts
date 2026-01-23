import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  // 🔹 ALTERAÇÃO: SQLite não suporta enum, usamos string
  @Column({ type: 'text', default: UserRole.USER })
  role: UserRole;
  evaluations: any;
    comments: any;
}
