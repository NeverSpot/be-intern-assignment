import {
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from './User';
import { Post } from './Post';


@Entity()
export class Like {
  @PrimaryColumn("int")
  likerId: number;

  @PrimaryColumn("int")
  postId: number;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  liker: User;

  @ManyToOne(() => Post, (p) => p.liker, { onDelete: 'CASCADE' })
  post: Post;
}