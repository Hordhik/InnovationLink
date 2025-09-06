import { projects } from '../models/projectModel.js';

export const getProjects = (req, res) => {
  res.json(projects);
};
