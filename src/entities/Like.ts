import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './User';
import { Post } from './Post';


@Entity()
export class Like {
  @PrimaryColumn('int')
  likerId: number;

  @PrimaryColumn('int')
  postId: number;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'likerId' })
  liker: User;

  @ManyToOne(() => Post, (p) => p.liker, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;
}