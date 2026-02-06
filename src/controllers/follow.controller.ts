import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { Follow } from '../entities/Follow';

export class FollowController {
  private userRepository = AppDataSource.getRepository(User);
  private followRepository = AppDataSource.getRepository(Follow);

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
      console.log(data);
      const result = await this.followRepository.save(data);
      res.status(201).json(result);
    } catch (e) {
      res.status(500).send('Error while Following the user');
    }
  }
}