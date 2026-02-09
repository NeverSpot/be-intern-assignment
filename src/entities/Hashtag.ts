import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn, PrimaryColumn,
} from 'typeorm';
import { Post } from './Post';

@Entity()
export class HashTag {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn('int')
  postId: number;

  @Column('varchar')
  value: string;

  @ManyToOne(() => Post, (post) => post.hashTags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'postId' })
  post: Post;
}