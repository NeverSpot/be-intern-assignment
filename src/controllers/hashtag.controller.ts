import {Request,Response} from 'express';
import { AppDataSource } from '../data-source';
import { Post } from '../entities/Post';
import { Like } from '../entities/Like';

export class HashtagController{
  private postRepository = AppDataSource.getRepository(Post);
  private likeRepository = AppDataSource.getRepository(Like);

  async findPostByTag(req:Request,res:Response){
    const tag = (req.params['tag'] as string).toLowerCase();
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);


    const posts = await this.postRepository
      .createQueryBuilder('p')
      .innerJoin('p.hashTags', 'h')
      .leftJoinAndSelect('p.author', 'u')
      .where('h.value = :tag', { tag })
      .take(limit)
      .skip(offset)
      .getMany();

    class postDataType {
      post: Post;
      likes: number;
    }
    const data: postDataType[] = [];

    const postIds=posts.map(p=>p.id);

    const likeCountsRaw = await this.likeRepository
      .createQueryBuilder('l')
      .select('l.postId', 'postId')
      .addSelect('COUNT(*)', 'likes')
      .where('l.postId IN (:...postIds)', { postIds })
      .groupBy('l.postId')
      .getRawMany();


    const likeCountMap = new Map<number, number>();
    for (const row of likeCountsRaw) {
      likeCountMap.set(Number(row.postId), Number(row.likes));
    }

    for(const post of posts){
      const postId = post.id;

      // const hashtags=await this.postRepository
      //   .createQueryBuilder('p')
      //   .innerJoin('p.hashTags','h')
      //   .select('h.value')
      //   .where('p.id=:postId',{postId})
      //   .getRawMany();
      // console.log(hashtags)

      const postData = new postDataType();
      postData.likes = likeCountMap.get(postId) ?? 0;
      postData.post = post;
      data.push(postData);

    }


    res.status(200).json(data)
  }
}