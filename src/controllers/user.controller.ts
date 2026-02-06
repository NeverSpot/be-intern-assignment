import { Request, Response } from 'express';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { Follow } from '../entities/Follow';
import {Like} from '../entities/Like';
import { AppDataSource } from '../data-source';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);
  private followRepository = AppDataSource.getRepository(Follow);
  private postRepository = AppDataSource.getRepository(Post);
  private likeRepository = AppDataSource.getRepository(Like);

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.userRepository.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await this.userRepository.findOneBy({
        id: parseInt(req.params.id),
      });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user', error });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const user = this.userRepository.create(req.body);
      const result = await this.userRepository.save(user);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error creating user', error });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const user = await this.userRepository.findOneBy({
        id: parseInt(req.params.id),
      });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      this.userRepository.merge(user, req.body);
      const result = await this.userRepository.save(user);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error updating user', error });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const result = await this.userRepository.delete(parseInt(req.params.id));
      if (result.affected === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting user', error });
    }
  }

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
        follower: follower,
        following: following,
      });
      res.status(201).json(result);
    } catch (e) {
      res.status(500).send('Error while Following the user');
    }
  }

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

      res.status(201).json(result)
    } catch (e) {
      res.status(500).send('Error while liking the post');
    }
  }
}

