import { getauthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import PostComments from "./PostComments"
import CreateComment from "./CreateComment"

interface CommentsSectionProps {
    postId: string
}

const CommentsSection = async ({ postId }: CommentsSectionProps) => {
    const session = await getauthSession()

    const comments = await db.comment.findMany({
        where: {
            postId,
            replyId: null
        },
        include: {
            author: true,
            votes: true,
            replies: {
                include: {
                    author: true,
                    votes: true
                }
            }
        }
    })

    return (
        <div className="flex flex-col gap-y-4 mt-4">
            <hr className="w-full h-px my-6" />

            <CreateComment postId={postId} />

            <div className="flex flex-col gap-y-6 mt-4">
                {
                    comments.filter((comment) => !comment.replyId).map(topLevelComment => {
                        const topLevelCommentVotesAmount = topLevelComment.votes.reduce((acc, vote) => {
                            if (vote.type === 'UP') return acc + 1
                            if (vote.type === 'DOWN') return acc - 1
                            return acc
                        }, 0)

                        const topLevelCommentVotes = topLevelComment.votes.find(vote => vote.userId === session?.user.id)

                        return (
                            <div key={topLevelComment.id} className="flex flex-col">
                                <div className="mb-2">
                                    <PostComments
                                        postId={postId}
                                        comment={topLevelComment}
                                        votesAmt={topLevelCommentVotesAmount}
                                        currentVote={topLevelCommentVotes}
                                    />
                                </div>

                                 {/* render replies */}

                                {
                                    topLevelComment.replies.sort((a, b) => b.votes.length - a.votes.length).map(reply => {

                                        const replyVotesAmt = reply.votes.reduce((acc, vote) => {
                                            if (vote.type === 'UP') return acc + 1
                                            if (vote.type === 'DOWN') return acc - 1
                                            return acc
                                        }, 0)

                                        const replyVotes = reply.votes.find(vote => vote.userId === session?.user.id)

                                        return (
                                            <div key={reply.id} className="ml-2 py-2 pl-4 border-l-2 border-zinc-200">
                                                <PostComments
                                                    postId={postId}
                                                    comment={reply}
                                                    votesAmt={replyVotesAmt}
                                                    currentVote={replyVotes}
                                                />
                                            </div>
                                        )
                                    })
                                }

                            </div>
                        )
                    })
                }
            </div>

        </div>
    )
}

export default CommentsSection