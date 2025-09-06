import { blogs } from '../models/blogModel.js';

export const getBlogs = (req, res) => {
  res.json(blogs);
};
