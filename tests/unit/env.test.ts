import { describe, it, expect } from 'vitest';
import { parseEnv, EnvConfigError } from '@/lib/env';

const RESEND = { RESEND_API_KEY: 're_test_key', CONTACT_FROM_EMAIL: 'quotes@orvixllc.com' };
const SMTP = {
  SMTP_HOST: 'smtp.example.com',
  SMTP_USER: 'user',
  SMTP_PASS: 'pass',
  CONTACT_FROM_EMAIL: 'quotes@orvixllc.com',
};

describe('parseEnv - transport selection', () => {
  it('reports transport "none" when nothing is configured', () => {
    expect(parseEnv({}).transport).toBe('none');
  });

  it('selects resend when RESEND_API_KEY and a sender are present', () => {
    expect(parseEnv(RESEND).transport).toBe('resend');
  });

  it('selects smtp when all three SMTP vars and a sender are present', () => {
    expect(parseEnv(SMTP).transport).toBe('smtp');
  });

  it('prefers resend when both providers are fully configured', () => {
    expect(parseEnv({ ...RESEND, ...SMTP }).transport).toBe('resend');
  });
});

describe('parseEnv - coherence failures', () => {
  it('throws when RESEND_API_KEY is set without CONTACT_FROM_EMAIL', () => {
    expect(() => parseEnv({ RESEND_API_KEY: 're_test_key' })).toThrow(EnvConfigError);
  });

  it('names CONTACT_FROM_EMAIL in the resend error message', () => {
    expect(() => parseEnv({ RESEND_API_KEY: 're_test_key' })).toThrow(
      /CONTACT_FROM_EMAIL/
    );
  });

  it('throws when SMTP is partially configured', () => {
    expect(() =>
      parseEnv({ SMTP_HOST: 'smtp.example.com', CONTACT_FROM_EMAIL: 'a@b.com' })
    ).toThrow(EnvConfigError);
  });

  it('names the missing SMTP vars in the error message', () => {
    let message = '';
    try {
      parseEnv({ SMTP_HOST: 'smtp.example.com', CONTACT_FROM_EMAIL: 'a@b.com' });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('SMTP_USER');
    expect(message).toContain('SMTP_PASS');
  });

  it('throws when full SMTP credentials are present without a sender', () => {
    const { CONTACT_FROM_EMAIL, ...withoutSender } = SMTP;
    expect(() => parseEnv(withoutSender)).toThrow(EnvConfigError);
  });
});

describe('parseEnv - defaults and coercion', () => {
  it('defaults the recipient to info@orvixllc.com', () => {
    expect(parseEnv({}).contactToEmail).toBe('info@orvixllc.com');
  });

  it('honours an explicit CONTACT_TO_EMAIL', () => {
    const env = parseEnv({ CONTACT_TO_EMAIL: 'sales@orvixllc.com' });
    expect(env.contactToEmail).toBe('sales@orvixllc.com');
  });

  it('falls back to the default recipient when CONTACT_TO_EMAIL is not an email', () => {
    expect(parseEnv({ CONTACT_TO_EMAIL: 'not-an-email' }).contactToEmail).toBe(
      'info@orvixllc.com'
    );
  });

  it('defaults SMTP_PORT to 587', () => {
    expect(parseEnv(SMTP).smtp?.port).toBe(587);
  });

  it('coerces a numeric SMTP_PORT string', () => {
    expect(parseEnv({ ...SMTP, SMTP_PORT: '465' }).smtp?.port).toBe(465);
  });

  it('falls back to 587 for a non-numeric SMTP_PORT', () => {
    expect(parseEnv({ ...SMTP, SMTP_PORT: 'not-a-port' }).smtp?.port).toBe(587);
  });

  it('treats a whitespace-only key as unset rather than configured', () => {
    expect(parseEnv({ RESEND_API_KEY: '   ' }).transport).toBe('none');
  });
});
