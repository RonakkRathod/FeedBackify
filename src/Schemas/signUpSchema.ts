import {z} from 'zod';

export const usernameValidation = z
    .string()
    .min(2,"Username must be Atleast 2 chracteres")
    .max(20,"username no more than 20 characteres")
    .regex(/^[a-z0-9_]{3,16}$/i,"username must not contain special characteres")
    .trim()

export const signUpSchema = z.object({ // for grouping validations 
    username: usernameValidation,
    email: z.string().email({message:"Invalid email address"}),
    password: z.string().min(6,{message:"Password must be at least 6 characters"})
})