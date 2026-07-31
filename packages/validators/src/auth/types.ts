import { z } from 'zod';
import { LoginSchema, RefreshTokenSchema } from './schema';

export type Login = z.infer<typeof LoginSchema>;
export type RefreshToken = z.infer<typeof RefreshTokenSchema>;
