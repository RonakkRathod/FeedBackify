import {z} from 'zod';

export const signInSchema = z.object({
    identifier: z.string(), // email/username
    password: z.string(),
})