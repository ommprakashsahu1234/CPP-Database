import { Router } from 'express';

const router = Router();

router.get('/overview', (_req, res) => {
  res.json({ message: 'Teacher overview placeholder' });
});

export default router;
