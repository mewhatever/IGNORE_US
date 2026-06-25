import { Router } from 'express';
import {
  classifyTicketAsync,
} from '../services/ticketClassifier.js';
import {
  VALID_CHANNELS,
  VALID_LOCALES,
} from '../services/classifier.js';
import { saveTicket } from '../services/auth.js';
import { sortTicketLimiter } from '../middleware/security.js';

const router = Router();

function validateBody(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return ['Request body must be a JSON object'];
  }

  if (!body.ticket_id || typeof body.ticket_id !== 'string' || !body.ticket_id.trim()) {
    errors.push('ticket_id is required and must be a non-empty string');
  }

  if (!body.message || typeof body.message !== 'string' || !body.message.trim()) {
    errors.push('message is required and must be a non-empty string');
  }

  if (body.channel && !VALID_CHANNELS.includes(body.channel)) {
    errors.push(`channel must be one of: ${VALID_CHANNELS.join(', ')}`);
  }

  if (body.locale && !VALID_LOCALES.includes(body.locale)) {
    errors.push(`locale must be one of: ${VALID_LOCALES.join(', ')}`);
  }

  return errors;
}

router.post('/sort-ticket', sortTicketLimiter, async (req, res) => {
  const errors = validateBody(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  const { ticket_id, channel, locale, message } = req.body;

  let classification;
  try {
    classification = await classifyTicketAsync({ message, locale });
  } catch (err) {
    console.error('Classification error:', err.message);
    return res.status(503).json({ error: 'Classification service unavailable' });
  }

  // Strip internal metadata before grader response
  const { classified_by: _classifiedBy, ...result } = classification;

  try {
    await saveTicket({
      ticket_id: ticket_id.trim(),
      channel,
      locale,
      message: message.trim(),
      classification,
      agentId: req.user?.sub || null,
    });
  } catch (err) {
    console.error('Failed to persist ticket:', err.message);
  }

  return res.json({
    ticket_id: ticket_id.trim(),
    ...result,
  });
});

export default router;
