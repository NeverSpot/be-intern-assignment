import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
import { createUserSchema, updateUserSchema } from '../validations/user.validation';
import { UserController } from '../controllers/user.controller';

export const userRouter = Router();
const userController = new UserController();

// Get all users
userRouter.get('/', userController.getAllUsers.bind(userController));

// Get user by id
userRouter.get('/:id', userController.getUserById.bind(userController));

// Create new user
userRouter.post('/', validate(createUserSchema), userController.createUser.bind(userController));

// Update user
userRouter.put('/:id', validate(updateUserSchema), userController.updateUser.bind(userController));

// Delete user
userRouter.delete('/:id', userController.deleteUser.bind(userController));

// Follow user
userRouter.post('/follow/:followerId/:followingId', userController.followUser.bind(userController));

// UnFollow user
userRouter.post('/unfollow/:followerId/:followingId', userController.unfollowUser.bind(userController));

// Like post by user
userRouter.post('/like/:userId/:postId', userController.like.bind(userController));
