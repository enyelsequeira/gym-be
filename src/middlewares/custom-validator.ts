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

      const fieldPaths = result.error.issues.map((issue) =>
        issue.path.length > 0 ? issue.path.join('.') : 'unknown'
      );
      const uniqueFields = [...new Set(fieldPaths)];

      const groupedErrors = result.error.issues.reduce(
        (acc, issue) => {
          const field = issue.path.join('.') || 'unknown';
          if (!acc[field]) {
            acc[field] = [];
          }
          acc[field].push(issue.message);
          return acc;
        },
        {} as Record<string, string[]>
      );

      return c.json(
        {
          success: false,
          errorCode: 400,
          errorMessage: `Validation failed for: ${uniqueFields.join(', ')}`,
          message: validationError.message,
          errors: groupedErrors,
          details: validationError.details,
          apiPoint,
        },
        400
      );
    }
  });
