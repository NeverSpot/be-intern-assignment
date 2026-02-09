import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { Follow } from '../entities/Follow';
import { Activity } from '../entities/Activity';

export class FollowController {
  private userRepository = AppDataSource.getRepository(User);
  private followRepository = AppDataSource.getRepository(Follow);
  private activityRepository = AppDataSource.getRepository(Activity);

  async followUser(req: Request, res: Response) {
    try {
      const followerId = parseInt(req.params['followerId']);
      const followingId = parseInt(req.params['followingId']);

      const follower = await this.userRepository.findOneBy({ id: followerId });
      const following = await this.userRepository.findOneBy({ id: followingId });

      if (!follower || !following) {
        return res.status(404).send('User not found');
      }
      const data = this.followRepository.create({
        follower: follower,
        following: following,
      });

      // Adding to activity DB
      await this.activityRepository.save(
        this.activityRepository.create({
          activityType: 'Follow',
          userId: follower.id,
          activityData: following.id,
        })
      );

      const result = await this.followRepository.save(data);
      res.status(201).json(result);
    } catch (e) {
      res.status(500).send('Error while Following the user');
    }
  }

  async getFollower(req:Request,res:Response){
    const userId = parseInt(req.params['id']);
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

    const followerList = await this.followRepository
      .createQueryBuilder('f')
      .where('f.followingId=:userId', { userId })
      .orderBy('f.followedAt',"DESC")
      .take(limit)
      .skip(offset)
        .getMany();

    const followerIds = followerList.map((f) => f.followerId);
    if (followerIds.length === 0) {
      return res.status(200).json([[], 0]);
    }
    const [followers,count]:[User[],number] = await this.userRepository
        .createQueryBuilder('u')
        .where('u.id In(:...followerIds)',{followerIds})
        .getManyAndCount();

    res.status(201).json({
      count,
      followers
    });
  }
}