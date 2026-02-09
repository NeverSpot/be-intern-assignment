import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { Like } from '../entities/Like';
import { Activity } from '../entities/Activity';


export class LikeController {
  private userRepository = AppDataSource.getRepository(User);
  private postRepository = AppDataSource.getRepository(Post);
  private likeRepository = AppDataSource.getRepository(Like);
  private activityRepository = AppDataSource.getRepository(Activity);

  async like(req: Request, res: Response) {
    try {
      const postId = parseInt(req.params['postId']);
      const userId = parseInt(req.params['userId']);

      const liker = await this.userRepository.findOneBy({ id: userId });
      if (!liker) return res.status(404).send('User not found');

      const post = await this.postRepository.findOneBy({ id: postId });
      if (!post) return res.status(404).send('post not found');

      const like = this.likeRepository.create({ liker, post });
      const result = await this.likeRepository.save(like);

      // Adding to activity DB
      await this.activityRepository.save(
        this.activityRepository.create({
          activityType: 'Like',
          userId: userId,
          activityData: postId,
        })
      );

      res.status(201).json(result);
    } catch (e) {
      res.status(500).send('Error while liking the post');
    }
  }
}