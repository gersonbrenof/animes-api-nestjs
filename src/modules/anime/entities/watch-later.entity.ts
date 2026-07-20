import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('watch_later')
export class WatchLater {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  // Armazena o ID original do Anime
  @Column()
  animeId: number;

  // Armazena o objeto completo como JSON
  @Column('simple-json') 
  animeData: {
    title: string;
    main_picture: { medium: string; large: string };
    synopsis: string;
    mean: number;
    genres: { id: number; name: string }[];
    start_date: string;
    num_episodes: number;
    status: string;
  };

  @CreateDateColumn()
  createdAt: Date;
}