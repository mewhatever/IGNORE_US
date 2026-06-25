const FORBIDDEN_SUMMARY_PATTERNS = [
  /\b(pin|otp|password|passcode)\b/i,
  /\bfull\s+card\s+number\b/i,
  /\bshare\s+your\s+(pin|otp|password)\b/i,
  /\bprovide\s+your\s+(pin|otp|password)\b/i,
];

// ---------------------------------------------------------------------------
// Keyword lexicons — English + Bengali + common mixed spellings (no LLM)
// ---------------------------------------------------------------------------

const KEYWORDS = {
  phishing_or_social_engineering: {
    en: [
      'otp', 'one time password', 'one-time password', 'pin', 'password', 'passcode',
      'cvv', 'cvc', 'card number', 'full card', 'verification code', 'security code',
      'scam', 'phishing', 'fraud', 'fraudster', 'fake call', 'fake sms', 'fake message',
      'impersonat', 'social engineering', 'hacker', 'hack', 'suspicious', 'stranger',
      'unknown caller', 'unknown number', 'asked for my', 'asking for my', 'wanted my',
      'share your', 'give your', 'tell your', 'send your', 'provide your',
      'someone called', 'someone texted', 'someone messaged', 'got a call',
      'is that bkash', 'is this bkash', 'is it bkash', 'pretending to be',
      'nagad', 'rocket', 'bkash agent', 'bank agent', 'police call',
    ],
    bn: [
      'ওটিপি', 'ও টি পি', 'পিন', 'পাসওয়ার্ড', 'পাসওয়ার্ড', 'পাস কোড', 'পাসকোড',
      'গোপন', 'গোপন নম্বর', 'গোপন সংখ্যা', 'ভেরিফিকেশন', 'ভেরিফিকেশন কোড',
      'কার্ড নম্বর', 'কার্ড নাম্বার', 'সিকিউরিটি কোড',
      'প্রতারণা', 'প্রতারক', 'ঠকানো', 'ঠকিয়েছে', 'জাল', 'ফেক', 'স্ক্যাম', 'হ্যাক',
      'সন্দেহজনক', 'অনুমানহীন', 'অচেনা', 'অপরিচিত',
      'কেউ', 'কেউকো', 'কোনো লোক', 'কোন একজন', 'একজন লোক',
      'ফোন', 'কল', 'ফোন করেছে', 'কল করেছে', 'মেসেজ', 'এসএমএস', 'মেসেজ করেছে',
      'চেয়েছিল', 'চেয়েছিল', 'চাইছে', 'চাইল', 'চেয়েছে', 'চেয়েছে', 'দিতে বলল',
      'দিয়ে বলল', 'দিয়ে বলল', 'শেয়ার', 'শেয়ার', 'বলেছে দিতে',
      'বিকাশ', 'নগদ', 'রকেট', 'বিকাশ এজেন্ট', 'ব্যাংক',
      'এটা কি বিকাশ', 'এটা বিকাশ', 'বিকাশ কি', 'সত্যি বিকাশ',
    ],
  },

  wrong_transfer: {
    en: [
      'wrong number', 'wrong account', 'wrong recipient', 'wrong person', 'wrong bkash',
      'wrong nagad', 'wrong mobile', 'incorrect number', 'incorrect account',
      'mistakenly sent', 'accidentally sent', 'sent by mistake', 'sent to wrong',
      'transferred to wrong', 'wrong transfer', 'misdirected', 'wrong receiver',
      'get it back', 'get back', 'recover', 'recovery', 'reverse transfer',
      'sent money to', 'sent taka to', 'sent tk to', 'wrong place',
    ],
    bn: [
      'ভুল নম্বর', 'ভুল নাম্বার', 'ভুল নম্বরে', 'ভুল নাম্বারে',
      'ভুল অ্যাকাউন্ট', 'ভুল একাউন্ট', 'ভুল মানুষ', 'ভুল ব্যক্তি', 'ভুল জায়গায়', 'ভুল জায়গায়',
      'ভুলে পাঠিয়েছি', 'ভুলে পাঠিয়েছি', 'ভুলে দিয়েছি', 'ভুলে দিয়েছি',
      'ভুল করে পাঠিয়েছি', 'ভুল করে পাঠিয়েছি', 'ভুল করে দিয়েছি', 'ভুল করে দিয়েছি',
      'ভুলে ট্রান্সফার', 'ভুলে পাঠানো', 'ভুলে পাঠিয়ে', 'ভুলে পাঠিয়ে',
      'নম্বরে পাঠিয়েছি', 'নম্বরে পাঠিয়েছি', 'অ্যাকাউন্টে পাঠিয়েছি', 'অ্যাকাউন্টে পাঠিয়েছি',
      'টাকা ফেরত', 'টাকা ফিরে', 'ফিরে পেতে', 'ফেরত চাই', 'উদ্ধার',
      'ভুল নম্বরে টাকা', 'ভুলে টাকা', 'ভুল নম্বরে বিকাশ',
    ],
  },

  payment_failed: {
    en: [
      'payment failed', 'transaction failed', 'payment unsuccessful', 'txn failed',
      'transfer failed', 'send money failed', 'could not pay', 'payment error',
      'balance deducted', 'money deducted', 'amount deducted', 'balance cut',
      'charged but', 'deducted but', 'taken but', 'money gone but',
      'stuck', 'pending forever', 'not completed', 'did not complete',
      'failed but balance', 'failed but money', 'failed but deducted',
      'unsuccessful payment', 'declined', 'payment declined',
    ],
    bn: [
      'পেমেন্ট ব্যর্থ', 'পেমেন্ট হয়নি', 'পেমেন্ট হয়নি', 'পেমেন্ট হচ্ছে না',
      'লেনদেন ব্যর্থ', 'লেনদেন হয়নি', 'লেনদেন হয়নি', 'লেনদেন হচ্ছে না',
      'ট্রানজেকশন ব্যর্থ', 'ট্রানজেকশন হয়নি', 'ট্রানজেকশন হয়নি',
      'টাকা কেটে গেছে', 'টাকা কাটা', 'টাকা কেটেছে', 'ব্যালেন্স কেটে',
      'ব্যালেন্স কেটে গেছে', 'ব্যালান্স কেটে', 'টাকা চলে গেছে',
      'কেটে নিয়েছে', 'কেটে নিয়েছে', 'কাটা পড়েছে', 'কাটা পড়েছে',
      'হয়নি কিন্তু', 'হয়নি কিন্তু', 'ব্যর্থ কিন্তু', 'ফেইল কিন্তু',
      'সফল হয়নি', 'সফল হয়নি', 'সম্পন্ন হয়নি', 'সম্পন্ন হয়নি',
      'আটকে আছে', 'পেন্ডিং', 'পেন্ডিং আছে',
    ],
  },

  refund_request: {
    en: [
      'refund', 'money back', 'return my money', 'give back', 'want back',
      'changed my mind', 'change my mind', 'cancel transaction', 'cancel payment',
      'reverse payment', 'reverse transaction', 'chargeback', 'dispute charge',
      'did not authorize', 'unauthorized', 'not mine', 'wrong purchase',
      'return payment', 'take back', 'reimburse',
    ],
    bn: [
      'রিফান্ড', 'রিফান্ড চাই', 'রিফান্ড দিন', 'রিফান্ড করুন',
      'টাকা ফেরত', 'টাকা ফিরে চাই', 'টাকা ফেরত চাই', 'টাকা ফিরিয়ে',
      'টাকা ফিরিয়ে', 'ফেরত চাই', 'ফেরত দিন', 'ফেরত দেওয়া',
      'মন পরিবর্তন', 'মন পরিবর্তন করেছি', 'মন বদল', 'মন বদলেছে',
      'বাতিল', 'বাতিল করুন', 'লেনদেন বাতিল', 'পেমেন্ট বাতিল',
      'ফিরিয়ে দিন', 'ফিরিয়ে দিন', 'ফেরত পেতে চাই',
      'আমি চাই না', 'কেনা বাতিল',
    ],
  },

  other: {
    en: [
      'app crash', 'app crashed', 'crashed', 'not opening', 'won\'t open', 'cant open',
      'login problem', 'cannot login', 'can\'t login', 'sign in issue', 'log in issue',
      'slow', 'lag', 'freeze', 'frozen', 'hang', 'hanging', 'bug', 'glitch',
      'error message', 'showing error', 'not working', 'doesn\'t work', 'broken',
      'update problem', 'install problem', 'screen blank', 'white screen',
    ],
    bn: [
      'অ্যাপ ক্র্যাশ', 'অ্যাপ বন্ধ', 'অ্যাপ খুলছে না', 'অ্যাপ ওপেন হয় না', 'অ্যাপ ওপেন হয় না',
      'অ্যাপ কাজ করছে না', 'অ্যাপ চলছে না', 'অ্যাপ হ্যাং', 'অ্যাপ ল্যাগ',
      'লগইন', 'লগইন হচ্ছে না', 'লগইন সমস্যা', 'সাইন ইন',
      'ধীর', 'স্লো', 'আটকে', 'হ্যাং', 'বাগ', 'গ্লিচ', 'ত্রুটি', 'এরর',
      'কাজ করছে না', 'চলছে না', 'ভেঙে গেছে', 'সমস্যা',
      'আপডেট', 'ইনস্টল', 'স্ক্রিন ফাঁকা',
    ],
  },
};

// High-confidence regex patterns (run on normalized text)
const PHISHING_PATTERNS = [
  { pattern: /\b(otp|one[- ]time\s+password)\b/i, weight: 0.35 },
  { pattern: /\b(pin|password|passcode|cvv|cvc)\b/i, weight: 0.3 },
  { pattern: /\b(scam|phishing|fraudster|fake\s+(call|sms|message))\b/i, weight: 0.35 },
  { pattern: /\b(social\s+engineering|impersonat|suspicious)\b/i, weight: 0.3 },
  { pattern: /\b(asked?|asking|wanted)\s+(for\s+)?(my\s+)?(otp|pin|password)\b/i, weight: 0.4 },
  { pattern: /\b(someone|stranger|unknown)\s+(called|asked|texted|messaged)\b/i, weight: 0.28 },
  { pattern: /\b(is\s+(it|that|this)\s+bkash|pretending\s+to\s+be)\b/i, weight: 0.3 },
  { pattern: /কেউ.*(otp|পিন|পাসওয়ার্ড|পাসওয়ার্ড|গোপন)/i, weight: 0.45 },
  { pattern: /(otp|পিন|গোপন).*(চাই|চেয়|চেয়|দিল|দিয়|দিয়|বলল)/i, weight: 0.4 },
  { pattern: /(চাই|চেয়|চেয়|দাবি|বলল).*(otp|পিন|পাসওয়ার্ড|পাসওয়ার্ড)/i, weight: 0.4 },
  { pattern: /(জাল|প্রতারণা|প্রতারক|স্ক্যাম|ফেক|ঠক)/i, weight: 0.35 },
  { pattern: /(ফোন|কল|মেসেজ|এসএমএস)\s*(করে|করেছে|এসেছে|পাঠ)/i, weight: 0.22 },
  { pattern: /(এটা|এই|ইস)\s*(কি|কি?)\s*(বিকাশ|bkash|নগদ|nagad)/i, weight: 0.3 },
];

const WRONG_TRANSFER_PATTERNS = [
  { pattern: /\bwrong\s+(number|account|recipient|person|bkash|mobile)\b/i, weight: 0.45 },
  { pattern: /\b(incorrect|mistaken)\s+(number|account|recipient)\b/i, weight: 0.4 },
  { pattern: /\bsent\s+.+\s+to\s+(the\s+)?wrong\b/i, weight: 0.4 },
  { pattern: /\b(mistakenly|accidentally)\s+sent\b/i, weight: 0.35 },
  { pattern: /\b(get\s+it\s+back|recover\s+money|reverse\s+transfer)\b/i, weight: 0.22 },
  { pattern: /ভুল\s*(নম্বর|নাম্বার|অ্যাকাউন্ট|একাউন্ট|মানুষ|ব্যক্তি)/i, weight: 0.45 },
  { pattern: /ভুল\s*(নম্বর|নাম্বার)ে/i, weight: 0.45 },
  { pattern: /(ভুলে|ভুল\s*করে)\s*(পাঠ|পাঠিয়|পাঠিয়|দিয়|দিয়|ট্রান্সফার|টাকা)/i, weight: 0.4 },
  { pattern: /নম্বরে\s*(পাঠ|পাঠিয়|পাঠিয়|দিয়|দিয়|টাকা)/i, weight: 0.35 },
];

const PAYMENT_FAILED_PATTERNS = [
  { pattern: /\bpayment\s+(failed|unsuccessful|declined|error)\b/i, weight: 0.45 },
  { pattern: /\btransaction\s+(failed|unsuccessful|declined)\b/i, weight: 0.4 },
  { pattern: /\b(balance|money|amount)\s+deducted\b/i, weight: 0.38 },
  { pattern: /\b(charged|deducted|taken)\s+but\b/i, weight: 0.3 },
  { pattern: /\bfailed\s+but\s+(balance|money|amount)\b/i, weight: 0.4 },
  { pattern: /(পেমেন্ট|লেনদেন|ট্রানজেকশন)\s*(ব্যর্থ|ফেইল|হয়নি|হয়নি|হচ্ছে\s*না|সফল\s*হয়নি|সফল\s*হয়নি)/i, weight: 0.45 },
  { pattern: /(ব্যালেন্স|ব্যালান্স|টাকা|টাকাটা)\s*(কেটে|কাটা|কেটে\s*গেছে|কেটেছে|চলে\s*গেছে)/i, weight: 0.4 },
  { pattern: /(ব্যর্থ|ফেইল).*(কিন্তু|তবু).*(কেটে|কাটা|টাকা|ব্যালেন্স)/i, weight: 0.42 },
];

const REFUND_PATTERNS = [
  { pattern: /\brefund\b/i, weight: 0.45 },
  { pattern: /\b(money\s+back|return\s+my\s+money|give\s+back)\b/i, weight: 0.32 },
  { pattern: /\bchanged\s+my\s+mind\b/i, weight: 0.28 },
  { pattern: /\bcancel(l)?\s+(the\s+)?(transaction|payment)\b/i, weight: 0.28 },
  { pattern: /\b(reverse|chargeback|reimburse)/i, weight: 0.3 },
  { pattern: /(রিফান্ড|রিফান্ড\s*চাই)/i, weight: 0.45 },
  { pattern: /(টাকা|টাকাটা)\s*(ফেরত|ফিরে)\s*(চাই|দিন|পাব|চাইছি)/i, weight: 0.4 },
  { pattern: /(মন\s*পরিবর্তন|মন\s*বদল)/i, weight: 0.28 },
  { pattern: /(লেনদেন|পেমেন্ট)\s*বাতিল/i, weight: 0.3 },
];

const OTHER_PATTERNS = [
  { pattern: /\b(app\s+)?crash(ed|ing)?\b/i, weight: 0.4 },
  { pattern: /\b(not\s+opening|won'?t\s+open|can'?t\s+open)\b/i, weight: 0.38 },
  { pattern: /\b(login|sign\s*in)\s+(problem|issue|fail|error)\b/i, weight: 0.35 },
  { pattern: /\b(not\s+working|doesn'?t\s+work|broken|bug|glitch)\b/i, weight: 0.32 },
  { pattern: /(অ্যাপ|এপ)\s*(ক্র্যাশ|বন্ধ|খুলছে\s*না|কাজ\s*করছে\s*না|চলছে\s*না|হ্যাং)/i, weight: 0.4 },
  { pattern: /(লগইন|সাইন\s*ইন).*(সমস্যা|হচ্ছে\s*না|পারছি\s*না)/i, weight: 0.35 },
  { pattern: /(ত্রুটি|এরর|বাগ|গ্লিচ|সমস্যা)/i, weight: 0.25 },
];

const CATEGORY_CONFIG = {
  phishing_or_social_engineering: { keywords: KEYWORDS.phishing_or_social_engineering, patterns: PHISHING_PATTERNS, keywordWeight: 0.11 },
  wrong_transfer: { keywords: KEYWORDS.wrong_transfer, patterns: WRONG_TRANSFER_PATTERNS, keywordWeight: 0.1 },
  payment_failed: { keywords: KEYWORDS.payment_failed, patterns: PAYMENT_FAILED_PATTERNS, keywordWeight: 0.1 },
  refund_request: { keywords: KEYWORDS.refund_request, patterns: REFUND_PATTERNS, keywordWeight: 0.1 },
  other: { keywords: KEYWORDS.other, patterns: OTHER_PATTERNS, keywordWeight: 0.09 },
};

/**
 * Normalize mixed bn/en text for consistent keyword matching.
 */
function normalizeForClassification(text) {
  let normalized = text.normalize('NFC').toLowerCase();

  // Bengali credential spellings → English tokens
  normalized = normalized.replace(/ও\s*[-]?\s*টি\s*[-]?\s*পি/gu, ' otp ');
  normalized = normalized.replace(/ওটিপি/gu, ' otp ');
  normalized = normalized.replace(/পিন\s*(কোড|নম্বর|নাম্বার)?/gu, ' pin ');
  normalized = normalized.replace(/পাস[\s-]?ওয়ার্ড|পাস[\s-]?ওয়ার্ড/gu, ' password ');
  normalized = normalized.replace(/গোপন\s*(নম্বর|নাম্বার|সংখ্যা)?/gu, ' pin ');
  normalized = normalized.replace(/ভেরিফিকেশন\s*কোড/gu, ' otp ');

  // Common brand / transliteration normalizations
  normalized = normalized.replace(/বিকাশ/gu, ' bkash ');
  normalized = normalized.replace(/নগদ/gu, ' nagad ');
  normalized = normalized.replace(/রকেট/gu, ' rocket ');

  // Bengali digits → ASCII (০-৯)
  const bnDigits = '০১২৩৪৫৬৭৮৯';
  normalized = normalized.replace(/[০-৯]/g, (d) => String(bnDigits.indexOf(d)));

  normalized = normalized.replace(/\s+/g, ' ').trim();
  return normalized;
}

function countKeywordHits(text, { en = [], bn = [] }) {
  let hits = 0;
  const lower = text.toLowerCase();

  for (const word of en) {
    const w = word.toLowerCase();
    if (lower.includes(w)) hits += 1;
  }

  for (const word of bn) {
    if (text.includes(word)) hits += 1;
  }

  return hits;
}

function scorePatterns(text, patterns) {
  let score = 0;
  for (const { pattern, weight } of patterns) {
    if (pattern.test(text)) {
      score += weight;
    }
  }
  return Math.min(score, 1);
}

function scoreCategory(text, config) {
  const hits = countKeywordHits(text, config.keywords);
  const keywordScore = Math.min(0.75, hits * config.keywordWeight);
  const patternScore = scorePatterns(text, config.patterns);
  return Math.min(1, keywordScore + patternScore);
}

function scorePhishing(text) {
  let score = scoreCategory(text, CATEGORY_CONFIG.phishing_or_social_engineering);

  const hasCredential =
    /\b(otp|pin|password|cvv|cvc)\b/i.test(text) ||
    /পিন|পাসওয়ার্ড|পাসওয়ার্ড|গোপন|ওটিপি/i.test(text);

  const someoneAskedBn =
    /কেউ|কেউকো|কোনো\s*লোক|অচেনা|অপরিচিত/i.test(text) &&
    /(চাই|চেয়|চেয়|দিল|দিয়|দিয়|দাবি|বলল|করেছে)/i.test(text);

  const someoneAskedEn =
    /\b(someone|stranger|unknown|caller)\b/i.test(text) &&
    /\b(asked|called|texted|messaged|wanted)\b/i.test(text);

  if (hasCredential && (someoneAskedBn || someoneAskedEn)) {
    score = Math.min(1, score + 0.4);
  }

  if (hasCredential && /\b(is\s+(it|that|this)\s+(bkash|nagad))\b/i.test(text)) {
    score = Math.min(1, score + 0.32);
  }

  if (hasCredential && /(এটা|এই)\s*(কি|কি?)\s*(বিকাশ|bkash|নগদ)/i.test(text)) {
    score = Math.min(1, score + 0.32);
  }

  return score;
}

function pickCaseType(text) {
  const scores = {
    phishing_or_social_engineering: scorePhishing(text),
    wrong_transfer: scoreCategory(text, CATEGORY_CONFIG.wrong_transfer),
    payment_failed: scoreCategory(text, CATEGORY_CONFIG.payment_failed),
    refund_request: scoreCategory(text, CATEGORY_CONFIG.refund_request),
    other: Math.max(0.05, scoreCategory(text, CATEGORY_CONFIG.other)),
  };

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topType, topScore] = ranked[0];
  const [, secondScore] = ranked[1];

  if (topType === 'other' || topScore < 0.2) {
    return { case_type: 'other', confidence: 0.62 };
  }

  const confidence = Math.min(0.97, 0.55 + topScore + (topScore - secondScore) * 0.15);
  return { case_type: topType, confidence: Number(confidence.toFixed(2)) };
}

function resolveSeverity(caseType, text) {
  if (caseType === 'phishing_or_social_engineering') {
    return 'critical';
  }
  if (caseType === 'wrong_transfer' || caseType === 'payment_failed') {
    return 'high';
  }
  if (caseType === 'refund_request') {
    if (
      /\b(dispute|unauthorized|didn't\s+approve|not\s+mine)\b/i.test(text) ||
      /(বিতর্ক|অননুমোদিত|আমার\s*নয়|আমার\s*নয়)/i.test(text)
    ) {
      return 'medium';
    }
    return 'low';
  }
  if (
    /\b(urgent|emergency|immediately|asap)\b/i.test(text) ||
    /(জরুরি|অতি\s*জরুরি|তাড়াতাড়ি|তড়াতড়ি|এখনই)/i.test(text)
  ) {
    return 'medium';
  }
  return 'low';
}

function resolveDepartment(caseType, severity) {
  switch (caseType) {
    case 'phishing_or_social_engineering':
      return 'fraud_risk';
    case 'wrong_transfer':
      return 'dispute_resolution';
    case 'payment_failed':
      return 'payments_ops';
    case 'refund_request':
      return severity === 'low' ? 'customer_support' : 'dispute_resolution';
    default:
      return 'customer_support';
  }
}

function extractAmount(text) {
  const match = text.match(/(\d[\d,]*)\s*(taka|tk|bdt|৳|টাকা)?/i);
  if (!match) return null;
  return match[1].replace(/,/g, '');
}

function buildSummary(caseType, text) {
  const amount = extractAmount(text);

  const summaries = {
    wrong_transfer: amount
      ? `Customer reports sending ${amount} BDT to the wrong recipient and requests recovery assistance.`
      : 'Customer reports sending money to the wrong recipient and requests recovery assistance.',
    payment_failed: amount
      ? `Customer reports a failed payment of ${amount} BDT with a possible balance deduction.`
      : 'Customer reports a failed payment with a possible balance deduction.',
    refund_request: amount
      ? `Customer requests a refund for a recent transaction of ${amount} BDT.`
      : 'Customer requests a refund for a recent transaction.',
    phishing_or_social_engineering:
      'Customer reports suspicious contact attempting to obtain sensitive account credentials.',
    other: 'Customer reports a general application or service issue requiring support follow-up.',
  };

  return summaries[caseType] || summaries.other;
}

function sanitizeSummary(summary) {
  for (const pattern of FORBIDDEN_SUMMARY_PATTERNS) {
    if (pattern.test(summary)) {
      return 'Customer ticket requires review by a support agent without requesting sensitive credentials.';
    }
  }
  return summary;
}

export { sanitizeSummary, resolveDepartment, resolveSeverity, buildSummary };

export function classifyTicket({ message }) {
  const text = (message || '').trim();
  const normalized = normalizeForClassification(text);

  const { case_type, confidence } = pickCaseType(normalized);
  const severity = resolveSeverity(case_type, normalized);
  const department = resolveDepartment(case_type, severity);
  const human_review_required =
    severity === 'critical' || case_type === 'phishing_or_social_engineering';

  const agent_summary = sanitizeSummary(buildSummary(case_type, text));

  return {
    case_type,
    severity,
    department,
    agent_summary,
    human_review_required,
    confidence,
  };
}

export const VALID_CASE_TYPES = [
  'wrong_transfer',
  'payment_failed',
  'refund_request',
  'phishing_or_social_engineering',
  'other',
];

export const VALID_SEVERITIES = ['low', 'medium', 'high', 'critical'];
export const VALID_DEPARTMENTS = [
  'customer_support',
  'dispute_resolution',
  'payments_ops',
  'fraud_risk',
];
export const VALID_CHANNELS = ['app', 'sms', 'call_center', 'merchant_portal'];
export const VALID_LOCALES = ['bn', 'en', 'mixed'];
