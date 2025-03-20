import type { PinoLogger } from 'hono-pino';

export interface AuthContext {
  user: Pick<any, 'id' | 'username' | 'type'>;
  session: any;
}

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
    user?: AuthContext['user'];
    session?: AuthContext['session'];
  };
}
