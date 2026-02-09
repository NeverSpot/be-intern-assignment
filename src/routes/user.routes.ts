import { Router } from 'express';
import { validate } from '../middleware/validation.middleware';
import { createUserSchema, updateUserSchema } from '../validations/user.validation';
import { UserController } from '../controllers/user.controller';
import { FollowController } from '../controllers/follow.controller';
import { UnfollowController } from '../controllers/unfollow.controller';
import { ActivityController } from '../controllers/activity.controller';

export const userRouter = Router();
const userController = new UserController();
const followController = new FollowController();
const unfollowController = new UnfollowController();
const activityController = new ActivityController();


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

// follow a user
userRouter.post("/:followerId/:followingId/follow",followController.followUser.bind(followController));

// unfollow a user
userRouter.post('/:followerId/:followingId/unfollow', unfollowController.unfollowUser.bind(unfollowController));

// Get all user Activities
userRouter.post('/:id/activity',activityController.getActivityById.bind(activityController));

userRouter.get('/:id/followers',followController.getFollower.bind(followController));