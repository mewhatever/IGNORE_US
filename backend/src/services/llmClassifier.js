import {
  VALID_CASE_TYPES,
  VALID_DEPARTMENTS,
  VALID_SEVERITIES,
  buildSummary,
  classifyTicket as classifyWithRules,
  resolveDepartment,
  resolveSeverity,
  sanitizeSummary,
} from './classifier.js';

const SYSTEM_PROMPT = `You classify customer support tickets for a Bangladesh digital finance company (like bKash).
Messages may be in English, Bengali (Bangla), or mixed bn/en.

Return ONLY valid JSON with this exact shape:
{
  "case_type": "wrong_transfer" | "payment_failed" | "refund_request" | "phishing_or_social_engineering" | "other",
  "severity": "low" | "medium" | "high" | "critical",
  "department": "customer_support" | "dispute_resolution" | "payments_ops" | "fraud_risk",
  "agent_summary": "one or two neutral English sentences for a human agent",
  "human_review_required": true | false,
  "confidence": number between 0 and 1
}

Classification guide:
- wrong_transfer: money sent to wrong number/account → severity high → dispute_resolution
- payment_failed: payment/transaction failed, balance may be deducted → severity high → payments_ops
- refund_request: customer wants money back → severity low (medium if disputed) → customer_support or dispute_resolution
- phishing_or_social_engineering: scam calls/SMS asking for OTP, PIN, password → severity critical → fraud_risk
- other: app crash, login issue, general bugs → severity low → customer_support

human_review_required MUST be true for phishing_or_social_engineering or critical severity.

SAFETY: agent_summary must NEVER ask the customer to share PIN, OTP, password, or full card number.`;

function getProvider() {
  const configured = (process.env.LLM_PROVIDER || '').toLowerCase();
  if (['groq', 'gemini', 'ollama', 'deepseek'].includes(configured)) {
    return configured;
  }
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.DEEPSEEK_API_KEY) return 'deepseek';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.OLLAMA_BASE_URL) return 'ollama';
  return null;
}

function getDefaultModel(provider) {
  switch (provider) {
    case 'groq':
      return 'llama-3.1-8b-instant';
    case 'deepseek':
      return 'deepseek-chat';
    case 'gemini':
      return 'gemini-2.0-flash-lite';
    case 'ollama':
      return process.env.OLLAMA_MODEL || 'llama3.2';
    default:
      return 'unknown';
  }
}

function getTimeoutMs() {
  return Math.min(parseInt(process.env.LLM_TIMEOUT_MS, 10) || 8000, 25000);
}

function extractJson(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(candidate);
}

function clampConfidence(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return 0.75;
  return Math.min(0.99, Math.max(0.5, Number(num.toFixed(2))));
}

function normalizeLlmResult(raw, message) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('LLM returned invalid JSON object');
  }

  let case_type = raw.case_type;
  let severity = raw.severity;
  let department = raw.department;

  if (!VALID_CASE_TYPES.includes(case_type)) {
    throw new Error(`Invalid case_type from LLM: ${case_type}`);
  }
  if (!VALID_SEVERITIES.includes(severity)) {
    severity = resolveSeverity(case_type, message);
  }
  if (!VALID_DEPARTMENTS.includes(department)) {
    department = resolveDepartment(case_type, severity);
  }

  const human_review_required =
    severity === 'critical' || case_type === 'phishing_or_social_engineering';

  let agent_summary =
    typeof raw.agent_summary === 'string' && raw.agent_summary.trim()
      ? raw.agent_summary.trim()
      : buildSummary(case_type, message);

  agent_summary = sanitizeSummary(agent_summary);

  return {
    case_type,
    severity,
    department,
    agent_summary,
    human_review_required,
    confidence: clampConfidence(raw.confidence),
    classified_by: 'llm',
  };
}

async function callGroq(message, locale) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set');

  const model = process.env.LLM_MODEL || 'llama-3.1-8b-instant';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), getTimeoutMs());

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        max_tokens: 400,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Locale: ${locale || 'unknown'}\nCustomer message:\n${message}`,
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error ${response.status}: ${errText.slice(0, 200)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Groq returned empty response');
    return extractJson(content);
  } finally {
    clearTimeout(timer);
  }
}

async function callDeepSeek(message, locale) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY is not set');

  const model = process.env.LLM_MODEL || 'deepseek-chat';
  const baseUrl = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), getTimeoutMs());

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        max_tokens: 400,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Locale: ${locale || 'unknown'}\nCustomer message:\n${message}`,
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DeepSeek API error ${response.status}: ${errText.slice(0, 200)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('DeepSeek returned empty response');
    return extractJson(content);
  } finally {
    clearTimeout(timer);
  }
}

async function callGemini(message, locale) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const model = process.env.LLM_MODEL || 'gemini-2.0-flash-lite';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), getTimeoutMs());

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${SYSTEM_PROMPT}\n\nLocale: ${locale || 'unknown'}\nCustomer message:\n${message}\n\nRespond with JSON only.`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 400,
          responseMimeType: 'application/json',
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errText.slice(0, 200)}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error('Gemini returned empty response');
    return extractJson(content);
  } finally {
    clearTimeout(timer);
  }
}

async function callOllama(message, locale) {
  const baseUrl = (process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, '');
  const model = process.env.LLM_MODEL || process.env.OLLAMA_MODEL || 'llama3.2';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), getTimeoutMs());

  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        stream: false,
        format: 'json',
        options: { temperature: 0.1 },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Locale: ${locale || 'unknown'}\nCustomer message:\n${message}`,
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama API error ${response.status}: ${errText.slice(0, 200)}`);
    }

    const data = await response.json();
    const content = data.message?.content;
    if (!content) throw new Error('Ollama returned empty response');
    return extractJson(content);
  } finally {
    clearTimeout(timer);
  }
}

async function callLlmProvider(message, locale) {
  const provider = getProvider();
  if (!provider) throw new Error('No LLM provider configured');

  switch (provider) {
    case 'groq':
      return callGroq(message, locale);
    case 'deepseek':
      return callDeepSeek(message, locale);
    case 'gemini':
      return callGemini(message, locale);
    case 'ollama':
      return callOllama(message, locale);
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

export function isLlmEnabled() {
  const mode = (process.env.CLASSIFIER_MODE || 'hybrid').toLowerCase();
  if (mode === 'rules') return false;
  return Boolean(getProvider());
}

export async function classifyWithLlm({ message, locale }) {
  const text = (message || '').trim();
  const raw = await callLlmProvider(text, locale);
  return normalizeLlmResult(raw, text);
}

export async function classifyTicketAsync({ message, locale }) {
  const mode = (process.env.CLASSIFIER_MODE || 'hybrid').toLowerCase();
  const text = (message || '').trim();

  if (mode === 'rules' || !isLlmEnabled()) {
    return { ...classifyWithRules({ message: text }), classified_by: 'rules' };
  }

  try {
    return await classifyWithLlm({ message: text, locale });
  } catch (err) {
    console.warn(`LLM classification failed (${getProvider()}):`, err.message);
    if (mode === 'llm') {
      throw err;
    }
    return { ...classifyWithRules({ message: text }), classified_by: 'rules' };
  }
}

export function getLlmStatus() {
  const provider = getProvider();
  return {
    mode: process.env.CLASSIFIER_MODE || 'hybrid',
    provider,
    enabled: isLlmEnabled(),
    model: process.env.LLM_MODEL || getDefaultModel(provider),
  };
}
