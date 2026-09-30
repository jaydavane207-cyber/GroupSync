import { projectService } from '../services/project.service.js';

export const getProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getAll();
    res.json({ data: projects });
  } catch (err) {
    next(err);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const project = await projectService.create(req.body);
    res.status(201).json({ data: project });
  } catch (err) {
    next(err);
  }
};

export default { getProjects, createProject };
