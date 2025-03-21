import type { Context } from 'hono';

export const createJsonResponse = <T = unknown>({
  c,
  success = true,
  data,
  message,
  statusCode = 200,
}: {
  c: Context;
  success?: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
}) => {
  const response = {
    success,
    ...(data && { data }),
    ...(message && { message }),
  };

  return c.json(response, statusCode as any);
};

// For resources
export const resourceCreated = <T>({
  c,
  data,
  message = 'Resource created successfully',
}: {
  c: Context;
  data: T;
  message?: string;
}) => {
  return createJsonResponse({ c, data, message, statusCode: 201 });
};

export const resourceUpdated = <T>({
  c,
  data,
  message = 'Resource updated successfully',
}: {
  c: Context;
  data: T;
  message?: string;
}) => {
  return createJsonResponse({ c, data, message, statusCode: 200 });
};

export const resourceDeleted = ({
  c,
  message = 'Resource deleted successfully',
}: {
  c: Context;
  message?: string;
}) => {
  return createJsonResponse({ c, message, statusCode: 204 });
};
