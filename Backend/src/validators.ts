import {z} from 'zod';

export const SignupSchema = z.object({
    username:z.string().min(4,"Username must be at least 4 characters").trim(),
    password:z.string().min(8,"Password must be at least 8 characters")
})