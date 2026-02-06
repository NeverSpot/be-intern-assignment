import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import {Post} from "./Post";
import {Follow} from './Follow';
import { Like } from './Like';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255 })
  firstName: string;

  @Column({ type: 'varchar', length: 255 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[] | null;

  @OneToMany(() => Follow, (f) => f.follower)
  following: Follow[];

  @OneToMany(() => Follow, (f) => f.following)
  followers: Follow[];

  @OneToMany(() => Like, (l) => l.liker)
  likes: Like[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
