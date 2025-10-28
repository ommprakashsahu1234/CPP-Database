import { Router } from 'express';

const router = Router();

router.get('/overview', (_req, res) => {
  res.json({ message: 'Student overview placeholder' });
});

export default router;
