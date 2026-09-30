import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';
import projectsRoutes from './projects.routes.js';
import teamsRoutes from './teams.routes.js';
import messagesRoutes from './messages.routes.js';
import notificationsRoutes from './notifications.routes.js';
import quizzesRoutes from './quizzes.routes.js';
import certificatesRoutes from './certificates.routes.js';
import skillsRoutes from './skills.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/projects', projectsRoutes);
router.use('/teams', teamsRoutes);
router.use('/messages', messagesRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/quizzes', quizzesRoutes);
router.use('/certificates', certificatesRoutes);
router.use('/skills', skillsRoutes);

export default router;
