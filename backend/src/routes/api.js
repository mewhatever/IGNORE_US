import { Router } from 'express';
import {
  comparePassword,
  findAgentByEmail,
  getDashboardStats,
  getTicketHistory,
  signToken,
} from '../services/auth.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const agent = await findAgentByEmail(email);
    if (!agent) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await comparePassword(password, agent.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken({
      sub: agent.id,
      email: agent.email,
      role: agent.role,
    });

    return res.json({
      token,
      user: {
        id: agent.id,
        email: agent.email,
        fullName: agent.full_name,
        role: agent.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/auth/me', authenticate, async (req, res) => {
  const agent = await findAgentByEmail(req.user.email);
  if (!agent) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({
    id: agent.id,
    email: agent.email,
    fullName: agent.full_name,
    role: agent.role,
  });
});

router.get('/tickets', authenticate, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const offset = parseInt(req.query.offset, 10) || 0;
    const tickets = await getTicketHistory({ limit, offset });
    return res.json({ tickets, limit, offset });
  } catch (err) {
    console.error('Ticket history error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

router.get('/stats', authenticate, async (_req, res) => {
  try {
    const stats = await getDashboardStats();
    return res.json(stats);
  } catch (err) {
    console.error('Stats error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
