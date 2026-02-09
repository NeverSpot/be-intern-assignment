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

    let filter=req.body.filter;
    if(filter===undefined){
      filter = ['Follow', 'Unfollow', 'Post', 'Like'];
    }
    const activities = await this.activityRepository
      .createQueryBuilder('a')
      .where('a.userId=:userId and a.activityType IN (:...filter)', { userId,filter })
      .orderBy('a.createdAt', 'DESC')
      .getMany();

    const data: result[] = [];
    for (const activity of activities) {
      data.push((await this.activityCreator(activity)));
    }
    res.status(201).json(data);
  }


}