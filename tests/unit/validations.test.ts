import { describe, it, expect } from 'vitest';
import { quoteSchema, fieldErrors, BUYER_TYPES, PRODUCT_INTERESTS } from '@/lib/validations';

const valid = {
  fullName: 'Karan Patel',
  company: 'ORVIX LLC',
  email: 'buyer@example.com',
  phone: '+1 919 555 0100',
  buyerType: 'Industrial Buyer',
  productInterest: 'Silica Sand',
  quantity: '25 MT',
  destinationCountry: 'India',
  message: 'Please share mesh range and packaging options for water filtration grade.',
  needSpecs: true,
};

describe('quoteSchema - happy path', () => {
  it('accepts a complete valid submission', () => {
    expect(quoteSchema.safeParse(valid).success).toBe(true);
  });

  it('defaults needSpecs to false when omitted', () => {
    const { needSpecs, ...withoutFlag } = valid;
    expect(quoteSchema.parse(withoutFlag).needSpecs).toBe(false);
  });

  it('accepts every declared buyer type', () => {
    for (const buyerType of BUYER_TYPES) {
      expect(quoteSchema.safeParse({ ...valid, buyerType }).success).toBe(true);
    }
  });

  it('accepts every declared product interest', () => {
    for (const productInterest of PRODUCT_INTERESTS) {
      expect(quoteSchema.safeParse({ ...valid, productInterest }).success).toBe(true);
    }
  });
});

describe('quoteSchema - empty and whitespace', () => {
  it.each(['fullName', 'company', 'email', 'phone', 'quantity', 'destinationCountry', 'message'])(
    'rejects an empty %s',
    (field) => {
      expect(quoteSchema.safeParse({ ...valid, [field]: '' }).success).toBe(false);
    }
  );

  it.each(['fullName', 'company', 'quantity', 'destinationCountry', 'message'])(
    'rejects a whitespace-only %s',
    (field) => {
      expect(quoteSchema.safeParse({ ...valid, [field]: '        ' }).success).toBe(false);
    }
  );

  it('trims surrounding whitespace rather than storing it', () => {
    expect(quoteSchema.parse({ ...valid, fullName: '   Karan Patel   ' }).fullName).toBe('Karan Patel');
  });

  it('trims the email before validating it', () => {
    expect(quoteSchema.parse({ ...valid, email: '  buyer@example.com  ' }).email).toBe('buyer@example.com');
  });
});

describe('quoteSchema - missing fields', () => {
  it.each(['fullName', 'company', 'email', 'phone', 'quantity', 'destinationCountry', 'message'])(
    'rejects a submission missing %s entirely',
    (field) => {
      const payload = { ...valid } as Record<string, unknown>;
      delete payload[field];
      expect(quoteSchema.safeParse(payload).success).toBe(false);
    }
  );

  it('rejects an entirely empty object', () => {
    expect(quoteSchema.safeParse({}).success).toBe(false);
  });

  it('rejects null and undefined bodies', () => {
    expect(quoteSchema.safeParse(null).success).toBe(false);
    expect(quoteSchema.safeParse(undefined).success).toBe(false);
  });
});

describe('quoteSchema - wrong types', () => {
  it.each([
    ['number', 42],
    ['boolean', true],
    ['array', ['a']],
    ['object', { nested: 1 }],
    ['null', null],
  ])('rejects a %s where a string is required', (_label, value) => {
    expect(quoteSchema.safeParse({ ...valid, fullName: value }).success).toBe(false);
  });

  it('rejects a body that is a bare string', () => {
    expect(quoteSchema.safeParse('fullName=Karan').success).toBe(false);
  });

  it('rejects a body that is an array', () => {
    expect(quoteSchema.safeParse([valid]).success).toBe(false);
  });
});

describe('quoteSchema - length bounds', () => {
  it('rejects a 1000-character name (max 120)', () => {
    expect(quoteSchema.safeParse({ ...valid, fullName: 'a'.repeat(1000) }).success).toBe(false);
  });

  it('rejects a 5000-character message (max 4000)', () => {
    expect(quoteSchema.safeParse({ ...valid, message: 'a'.repeat(5000) }).success).toBe(false);
  });

  it('accepts a message exactly at the 4000-character limit', () => {
    expect(quoteSchema.safeParse({ ...valid, message: 'a'.repeat(4000) }).success).toBe(true);
  });

  it('rejects a 1MB message outright', () => {
    expect(quoteSchema.safeParse({ ...valid, message: 'a'.repeat(1_000_000) }).success).toBe(false);
  });

  it('rejects an over-long email address', () => {
    expect(quoteSchema.safeParse({ ...valid, email: `${'a'.repeat(250)}@example.com` }).success).toBe(false);
  });

  it('rejects a message below the 10-character minimum', () => {
    expect(quoteSchema.safeParse({ ...valid, message: 'too short' }).success).toBe(false);
  });

  it('rejects an over-long phone number', () => {
    expect(quoteSchema.safeParse({ ...valid, phone: '1'.repeat(100) }).success).toBe(false);
  });
});

describe('quoteSchema - unicode and hostile strings', () => {
  it('accepts non-Latin names', () => {
    expect(quoteSchema.safeParse({ ...valid, fullName: 'Zhang Wei' }).success).toBe(true);
    expect(quoteSchema.safeParse({ ...valid, company: 'Orvix Handelsgesellschaft mbH' }).success).toBe(true);
  });

  it('accepts multi-byte characters in the message body', () => {
    const payload = 'Need 25MT silica sand by March. Ref: ₹ pricing, éèê.';
    const result = quoteSchema.safeParse({ ...valid, message: payload });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.message).toBe(payload);
  });

  it('accepts SQL-shaped input as ordinary text (there is no SQL here)', () => {
    const payload = "Robert'); DROP TABLE leads;--";
    const result = quoteSchema.safeParse({ ...valid, company: payload });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.company).toBe(payload);
  });

  it('accepts script-shaped input verbatim without mangling it', () => {
    const payload = '<script>alert(1)</script> need 10MT LECA';
    const result = quoteSchema.safeParse({ ...valid, message: payload });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.message).toBe(payload);
  });

  it('rejects a header-injection attempt in the email field', () => {
    const injected = 'buyer@example.com\nBcc: victim@example.com';
    expect(quoteSchema.safeParse({ ...valid, email: injected }).success).toBe(false);
  });
});

describe('quoteSchema - email validation', () => {
  it.each(['not-an-email', 'buyer@', '@example.com', 'buyer example.com', 'buyer@@example.com', ''])(
    'rejects %s',
    (email) => {
      expect(quoteSchema.safeParse({ ...valid, email }).success).toBe(false);
    }
  );

  it.each(['buyer@example.com', 'first.last+tag@sub.example.co.in'])('accepts %s', (email) => {
    expect(quoteSchema.safeParse({ ...valid, email }).success).toBe(true);
  });
});

describe('quoteSchema - enum fields', () => {
  it('rejects a buyer type outside the allowed list', () => {
    expect(quoteSchema.safeParse({ ...valid, buyerType: 'Sneaky Buyer' }).success).toBe(false);
  });

  it('rejects a product interest outside the allowed list', () => {
    expect(quoteSchema.safeParse({ ...valid, productInterest: 'Uranium' }).success).toBe(false);
  });
});

describe('quoteSchema - honeypot', () => {
  it('accepts an absent honeypot', () => {
    expect(quoteSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts an empty honeypot', () => {
    expect(quoteSchema.safeParse({ ...valid, website: '' }).success).toBe(true);
  });

  it('accepts a filled honeypot at the schema layer so the route can answer silently', () => {
    const result = quoteSchema.safeParse({ ...valid, website: 'http://spam.example' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.website).toBe('http://spam.example');
  });

  it('rejects an oversized honeypot value', () => {
    expect(quoteSchema.safeParse({ ...valid, website: 'a'.repeat(500) }).success).toBe(false);
  });
});

describe('fieldErrors', () => {
  it('maps each failing field to a human-readable message', () => {
    const result = quoteSchema.safeParse({ ...valid, fullName: '', email: 'nope' });
    expect(result.success).toBe(false);
    if (result.success) return;
    const errors = fieldErrors(result.error);
    expect(errors).toHaveProperty('fullName');
    expect(errors).toHaveProperty('email');
    expect(errors.email).toMatch(/valid email/i);
  });

  it('reports only the first message per field', () => {
    const result = quoteSchema.safeParse({ ...valid, message: '' });
    if (result.success) return;
    expect(typeof fieldErrors(result.error).message).toBe('string');
  });
});
