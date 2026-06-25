import { classifyTicket } from '../src/services/classifier.js';

const samples = [
  { message: 'I sent 3000 to wrong number', case_type: 'wrong_transfer', severity: 'high' },
  { message: 'Payment failed but balance deducted', case_type: 'payment_failed', severity: 'high' },
  { message: 'Someone called asking my OTP, is that bKash?', case_type: 'phishing_or_social_engineering', severity: 'critical' },
  { message: 'Please refund my last transaction, I changed my mind', case_type: 'refund_request', severity: 'low' },
  { message: 'App crashed when I opened it', case_type: 'other', severity: 'low' },
  // Mixed Bengali + English
  {
    message: 'কেউ আমার ও টি পি চেয়েছিল, Is it Bkash ?',
    case_type: 'phishing_or_social_engineering',
    severity: 'critical',
  },
  {
    message: 'আমি ৩০০০ টাকা ভুল নম্বরে পাঠিয়েছি',
    case_type: 'wrong_transfer',
    severity: 'high',
  },
  {
    message: 'পেমেন্ট ব্যর্থ হয়েছে কিন্তু ব্যালেন্স কেটে গেছে',
    case_type: 'payment_failed',
    severity: 'high',
  },
];

let passed = 0;
for (const sample of samples) {
  const result = classifyTicket({ message: sample.message });
  const ok = result.case_type === sample.case_type && result.severity === sample.severity;
  console.log(ok ? 'PASS' : 'FAIL', sample.message);
  console.log('  expected:', sample.case_type, sample.severity);
  console.log('  got:     ', result.case_type, result.severity, 'review:', result.human_review_required);
  if (ok) passed += 1;
}
console.log(`\n${passed}/${samples.length} passed`);
process.exit(passed === samples.length ? 0 : 1);
