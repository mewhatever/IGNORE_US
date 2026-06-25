import 'dotenv/config';
import { classifyTicketAsync, getLlmStatus } from '../src/services/ticketClassifier.js';

console.log('LLM status:', getLlmStatus());

const message = 'কেউ আমার ও টি পি চেয়েছিল, Is it Bkash ?';
const result = await classifyTicketAsync({ message, locale: 'mixed' });

console.log('Message:', message);
console.log('Result:', JSON.stringify(result, null, 2));
