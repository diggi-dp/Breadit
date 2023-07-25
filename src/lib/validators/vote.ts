import { z } from 'zod'

export const PostVoteValidator = z.object({
    postId: z.string(),
    voteType: z.enum(['UP', 'DOWN'])
})


export type PostVoteRequest = z.infer<typeof PostVoteValidator>

export const VoteCommentValidator = z.object({
    commentId: z.string(),
    voteType: z.enum(['UP', 'DOWN'])
})


export type VoteCommentRequest = z.infer<typeof VoteCommentValidator>

