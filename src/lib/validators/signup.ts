import { z } from 'zod'

export const SignupFormValidator = z.object({
    name: z.string().min(3).max(21).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
    password: z.string().min(8).max(23).regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[#@$!%*?&])[A-Za-z\d@$!%#*?&]+$/)
})



export type SignupFormRequest = z.infer<typeof SignupFormValidator>