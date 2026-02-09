import { Router } from 'express';
import { PostController } from '../controllers/post.controller';
import { LikeController } from '../controllers/like.controller';
import { HashtagController } from '../controllers/hashtag.controller';
import { validate } from '../middleware/validation.middleware';
import { createPostSchema } from '../validations/post.validation';

export const postRouter = Router();
const postController = new PostController();
const likeController = new LikeController();
const hashtagController = new HashtagController();

// Get all post
postRouter.get('/', postController.getAllPost.bind(postController));

// Get post by id
postRouter.get('/:id', postController.getPostById.bind(postController));

// Create new post
postRouter.post('/',validate(createPostSchema), postController.createPost.bind(postController));

// Delete post
postRouter.delete('/:id', postController.deletePost.bind(postController));

// Like post by user
postRouter.post('/:postId/like/:userId', likeController.like.bind(likeController));

// Find Posts by hashTags
postRouter.post('/hashtag/:tag',hashtagController.findPostByTag.bind(hashtagController));