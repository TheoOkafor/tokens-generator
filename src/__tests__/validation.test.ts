import { createTokenSchema, getTokensSchema } from '../validation/token';
import { ZodError } from 'zod';

describe('Validation Schemas', () => {
  describe('createTokenSchema', () => {
    it('should validate correct token creation data', () => {
      const validData = {
        userId: 'user123',
        scopes: ['read', 'write'],
        expiresInMinutes: 60,
      };

      const result = createTokenSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should reject empty userId', () => {
      const invalidData = {
        userId: '',
        scopes: ['read'],
        expiresInMinutes: 60,
      };

      expect(() => createTokenSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject empty scopes array', () => {
      const invalidData = {
        userId: 'user123',
        scopes: [],
        expiresInMinutes: 60,
      };

      expect(() => createTokenSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject scopes with empty strings', () => {
      const invalidData = {
        userId: 'user123',
        scopes: ['read', ''],
        expiresInMinutes: 60,
      };

      expect(() => createTokenSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject negative expiresInMinutes', () => {
      const invalidData = {
        userId: 'user123',
        scopes: ['read'],
        expiresInMinutes: -10,
      };

      expect(() => createTokenSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject zero expiresInMinutes', () => {
      const invalidData = {
        userId: 'user123',
        scopes: ['read'],
        expiresInMinutes: 0,
      };

      expect(() => createTokenSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject non-integer expiresInMinutes', () => {
      const invalidData = {
        userId: 'user123',
        scopes: ['read'],
        expiresInMinutes: 60.5,
      };

      expect(() => createTokenSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject expiresInMinutes exceeding 1 year', () => {
      const invalidData = {
        userId: 'user123',
        scopes: ['read'],
        expiresInMinutes: 525601, // 1 year + 1 minute
      };

      expect(() => createTokenSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should accept maximum allowed expiresInMinutes', () => {
      const validData = {
        userId: 'user123',
        scopes: ['read'],
        expiresInMinutes: 525600, // exactly 1 year
      };

      const result = createTokenSchema.parse(validData);
      expect(result.expiresInMinutes).toBe(525600);
    });

    it('should accept multiple scopes', () => {
      const validData = {
        userId: 'user123',
        scopes: ['read', 'write', 'admin', 'delete'],
        expiresInMinutes: 120,
      };

      const result = createTokenSchema.parse(validData);
      expect(result.scopes).toHaveLength(4);
    });
  });

  describe('getTokensSchema', () => {
    it('should validate correct userId', () => {
      const validData = {
        userId: 'user123',
      };

      const result = getTokensSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should reject empty userId', () => {
      const invalidData = {
        userId: '',
      };

      expect(() => getTokensSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should reject missing userId', () => {
      const invalidData = {};

      expect(() => getTokensSchema.parse(invalidData)).toThrow(ZodError);
    });

    it('should accept userId with special characters', () => {
      const validData = {
        userId: 'user_123-abc@example.com',
      };

      const result = getTokensSchema.parse(validData);
      expect(result.userId).toBe(validData.userId);
    });
  });
});
