import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class Activity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('int')
  userId: number;

  @Column('varchar')
  activityType: string;

  @Column('int')
  activityData: number;

  @CreateDateColumn()
  createdAt: Date;
}