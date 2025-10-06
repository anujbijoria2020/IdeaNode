import {z} from 'zod';

export const SignupSchema = z.object({
    username:z.string().min(4,"username cannot be less than 5 characters").trim(),
    password:z.string().min(7,"password cannot be less than 8 charaters")
})