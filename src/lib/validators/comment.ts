import { z } from "zod";

export const CommentValidator = z.object({
    postId : z.string(),
    text: z.string(),
    replyId : z.string().optional()
})

export type CommentRequest = z.infer<typeof CommentValidator>