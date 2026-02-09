import Joi from 'joi';


export const createPostSchema = Joi.object({
  content: Joi.string().required().min(1).max(2000).messages({
    'string.base': 'Content must be a string',
    'string.empty': 'Content cannot be empty',
    'string.min': 'Content must have at least 1 character',
    'string.max': 'Content cannot exceed 2000 characters',
    'any.required': 'Content is required',
  }),
  authorId: Joi.number().required().messages({
    'number.base': 'Author ID must be a number',
    'number.integer': 'Author ID must be an integer',
    'number.positive': 'Author ID must be positive',
    'any.required': 'Author ID is required',
  }),
  hashtags: Joi.array()
    .items(Joi.string().trim().lowercase().min(1).max(20))
    .unique()
    .optional()
    .messages({
      'array.base': 'Hashtags must be an array',
      'array.unique': 'Duplicate hashtags are not allowed',
    }),
});