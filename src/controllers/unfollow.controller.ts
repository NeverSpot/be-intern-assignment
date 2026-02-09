import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { Follow } from '../entities/Follow';
import { Activity } from '../entities/Activity';

export class UnfollowController {
  private userRepository = AppDataSource.getRepository(User);
  private followRepository = AppDataSource.getRepository(Follow);
  private activityRepository= AppDataSource.getRepository(Activity);

  async unfollowUser(req: Request, res: Response) {
    try {
      const followerId = parseInt(req.params['followerId']);
      const followingId = parseInt(req.params['followingId']);

      const follower = await this.userRepository.findOneBy({ id: followerId });
      const following = await this.userRepository.findOneBy({ id: followingId });

      if (!follower || !following) {
        return res.status(404).send('User not found');
      }
      const result = await this.followRepository.delete({
        followerId: follower.id,
        followingId: following.id,
      });

      // Adding to activity DB
      await this.activityRepository.save(
        this.activityRepository.create({
          activityType: 'Unfollow',
          userId: follower.id,
          activityData: following.id,
        })
      );
      res.status(201).json(result);
    } catch (e) {
      res.status(500).send('Error while Following the user');
    }
  }
}
