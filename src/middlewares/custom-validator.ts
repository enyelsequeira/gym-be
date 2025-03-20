import { zValidator as zv } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import type { ZodSchema } from 'zod';
import { createMessageBuilder, fromError } from 'zod-validation-error';

const messageBuilder = createMessageBuilder({
  maxIssuesInMessage: 3,
  issueSeparator: '; ',
  prefix: 'Failed',
  includePath: true,
});

export const CustomValidator = <T extends ZodSchema, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T,
  apiPoint: string
) =>
  zv(target, schema, (result, c) => {
    if (!result.success) {
      const validationError = fromError(result.error, { messageBuilder });
      return c.json(
        {
          success: false,
          message: validationError.message,
          details: validationError.details,
          apiPoint,
        },
        400
      );
    }
  });
