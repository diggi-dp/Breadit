import { getauthSession } from "@/lib/auth"
import { Post, Vote, VoteType } from "@prisma/client"
import { notFound } from "next/navigation"
import PostVoteClient from "./PostVoteClient"

interface PostVoteServerProps {
    postId: string
    initialVoteAmt?: number
    initialVote?: VoteType | null
    getData?: () => Promise<(Post & { votes: Vote[] }) | null>
}


const PostVoteServer = async ({ postId, initialVoteAmt, initialVote, getData }: PostVoteServerProps) => {
    const session = await getauthSession()

    let _votesAmt: number = 0
    let _currentVote: VoteType | null | undefined = undefined

    if (getData) {
        const post = await getData()
        if (!post) return notFound()

        _votesAmt = post.votes.reduce((acc, votes) => {
            if (votes.type === 'UP') return acc + 1
            if (votes.type === 'DOWN') return acc - 1
            return acc
        }, 0)

        _currentVote = post.votes.find((vote) => vote.userId === session?.user.id)?.type
    } else {
        _votesAmt = initialVoteAmt!
        _currentVote = initialVote
    }



    return (
        <PostVoteClient postId={postId} initialVoteAmount={_votesAmt} initialVote={_currentVote} />
    )
}

export default PostVoteServer