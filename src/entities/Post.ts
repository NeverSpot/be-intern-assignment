import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './User';
import { HashTag } from './Hashtag';
import { Like } from './Like';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content:string;

  @ManyToOne(()=>User, author => author.posts,{
    onDelete:"CASCADE"
  })
  @JoinColumn({name:"authorId"})
  author: User;

  @OneToMany(()=>HashTag,hashtag=>hashtag.post)
  hashTags:HashTag[];

  @OneToMany(()=>Like,l=>l.post)
  liker:Like[]

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
