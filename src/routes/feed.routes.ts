import { Router } from 'express';
import { FeedController } from '../controllers/feed.controller';


export const feedRouter = Router();

const feedController = new FeedController();

feedRouter.post('/',feedController.getFeed.bind(feedController));