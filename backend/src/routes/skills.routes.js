import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    data: ['React', 'Node.js', 'Python', 'TypeScript', 'PostgreSQL', 'Tailwind CSS'],
  });
});

export default router;
