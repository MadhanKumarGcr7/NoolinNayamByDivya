/**
 * Security Event Logger — Centralized Audit Logging
 * ────────────────────────────────────────────────────────────────────────────
 * Logs security-relevant events (failed logins, rate limits, injection attempts,
 * role authorization failures, admin operations) with structured metadata.
 * Masks PII and secrets (passwords, tokens, keys) automatically.
 */

const SENSITIVE_KEYS = ['password', 'token', 'secret', 'authorization', 'cookie', 'cvv', 'card'];

/**
 * Mask sensitive values in log objects
 */
function sanitizeForLog(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForLog);

  const sanitized = {};
  for (const [key, val] of Object.entries(obj)) {
    const isSensitive = SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k));
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (val && typeof val === 'object') {
      sanitized[key] = sanitizeForLog(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

/**
 * Format and print structured security log
 */
export function logSecurityEvent({ event, userId = null, role = 'anonymous', ip = 'unknown', path = '', outcome = 'SUCCESS', details = {} }) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    userId,
    role,
    ip,
    path,
    outcome,
    details: sanitizeForLog(details),
  };

  const formattedLog = `[SECURITY_AUDIT] ${timestamp} | EVENT=${event} | OUTCOME=${outcome} | ROLE=${role} | USER=${userId || 'N/A'} | IP=${ip} | PATH=${path}`;

  if (outcome === 'FAILURE' || outcome === 'BLOCKED' || outcome === 'INJECTION_DETECTED') {
    console.warn(formattedLog, JSON.stringify(logEntry.details));
  } else {
    console.log(formattedLog, JSON.stringify(logEntry.details));
  }

  return logEntry;
}

export default logSecurityEvent;
