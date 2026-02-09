import { Request, Response } from 'express';
import { Post } from '../entities/Post';
import {User} from "../entities/User"
import {HashTag} from "../entities/Hashtag"
import { AppDataSource } from '../data-source';
import { Activity } from '../entities/Activity';


export class PostController {
  private postRepository = AppDataSource.getRepository(Post);
  private userRepository = AppDataSource.getRepository(User);
  private hashRepository = AppDataSource.getRepository(HashTag);
  private activityRepository = AppDataSource.getRepository(Activity);

  async getAllPost(req: Request, res: Response) {
    try {
      const posts = await this.postRepository.createQueryBuilder().getMany();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching posts', error });
    }
  }
  async getPostById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(404).json('Post not found');
      }
      const post = await this.postRepository
        .createQueryBuilder('post')
        .where('post.id=:id', { id })
        .getOne();
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching post', error });
    }
  }
  async deletePost(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(404).json('Post not found');
      }
      const result = await this.postRepository.delete(id);
      if (result.affected === 0) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting post', error });
    }
  }
  async createPost(req: Request, res: Response) {
    try {
      const { content, authorId, hashtags } = req.body;
      const author = await this.userRepository.findOneBy({ id: authorId });
      if (!author) {
        return res.status(404).send('User not found');
      }
      const post = this.postRepository.create({
        content,
        author,
      });

      await this.postRepository.save(post);
      for (const value of hashtags as string) {
        // value ko lowercase me krdo
        const valueCaseInsensitive = value.toLowerCase();

        const hashtag = this.hashRepository.create({
          value: valueCaseInsensitive,
          post,
        });
        await this.hashRepository.save(hashtag);
      }

      // Adding to activity DB
      await this.activityRepository.save(
        this.activityRepository.create({
          activityType: "Post",
          userId: author.id,
          activityData: post.id,
        })
      );

      res.status(201).send('Post created');
    } catch (error) {
      res.status(500).json({ message: 'Error creating post', error });
    }
  }
}
