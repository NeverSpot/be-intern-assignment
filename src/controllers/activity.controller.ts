import { AppDataSource } from '../data-source';
import { Activity } from '../entities/Activity';
import { Request, Response } from 'express';
import { User } from '../entities/User';
import { Post} from '../entities/Post';


class result {
  activityType: string;
  activityData: User | Post;
}
export class ActivityController {

  private activityRepository = AppDataSource.getRepository(Activity);
  private postRepository = AppDataSource.getRepository(Post);
  private userRepository = AppDataSource.getRepository(User);

  async activityCreator(activity:Activity):Promise<result>{
    const newActivity = new result();
    newActivity.activityType = activity.activityType;
    if (activity.activityType === 'Follow' || activity.activityType === 'Unfollow') {
      const id = activity.activityData;
      const user = await this.userRepository.findOneBy({ id });
      if (user !== null) newActivity.activityData = user;
    } else if (activity.activityType === 'Like' || activity.activityType === 'Post') {
      const id = activity.activityData;
      const post = await this.postRepository.findOneBy({ id });
      if (post !== null) newActivity.activityData = post;
    }
    return newActivity;
  }

  async getActivityById(req: Request, res: Response) {
    const userId = parseInt(req.params['id']);
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);


    let filter=req.body.filter;
    if(!filter){
      filter = ['Follow', 'Unfollow', 'Post', 'Like'];
    }
    const activities = await this.activityRepository
      .createQueryBuilder('a')
      .where('a.userId=:userId and a.activityType IN (:...filter)', { userId,filter })
      .orderBy('a.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();

    const data: result[] = [];
    for (const activity of activities) {
      data.push((await this.activityCreator(activity)));
    }
    res.status(201).json(data);
  }


}