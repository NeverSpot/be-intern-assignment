import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Follow } from '../entities/Follow';
import { HashTag } from '../entities/Hashtag';
import { Like } from '../entities/Like';
import { Post } from '../entities/Post';


export class FeedController {
  private followRepository = AppDataSource.getRepository(Follow);
  private hashRepository = AppDataSource.getRepository(HashTag);
  private postRepository = AppDataSource.getRepository(Post);
  private likeRepository = AppDataSource.getRepository(Like);

  async getFeed(req: Request, res: Response) {
    const userId: number = parseInt(req.body['userId']);
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50 );
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

    const followers = await this.followRepository
      .createQueryBuilder('f')
      .select('f.followerId')
      .where('f.followingId=:userId', { userId })
      .getMany();
    const followerIds = followers.map((f) => f.followerId);
    const posts = await this.postRepository
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.author', 'u')
      .where('u.id IN (:...followerIds)', { followerIds })
      .orderBy('p.createdAt')
      .take(limit)
      .skip(offset)
      .getMany();

    class feedPost{
      post:Post;
      likes:number;
      hashtags:HashTag[];
    }
    const ans:feedPost[]=[];
    for(const post of posts){
      const postId=post.id;
      const likeCount=(await this.likeRepository.findBy({ postId })).length;
      const hashtags = await this.hashRepository.findBy({ postId })
      ans.push({
        post,
        likes: likeCount,
        hashtags,
      });
    }

    res.status(200).json(ans)
  }
}