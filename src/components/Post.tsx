import { formatTimeToNow } from '@/lib/utils'
import { Post, User, Vote } from '@prisma/client'
import { MessageSquare } from 'lucide-react'
import React, { FC, useRef } from 'react'
import EditorOutput from './EditorOutput'
import PostVoteClient from './post-vote/PostVoteClient'
import Link from 'next/link'
    
type PartialVote = Pick<Vote, 'type'>

interface PostProps {
    subredditName: string
    post: Post & {
        author: User
        votes: Vote[]
    },
    commentAmount: number
    votesAmt: number
    currentVote?: PartialVote
}

const Post: FC<PostProps> = ({ subredditName, post, commentAmount, votesAmt, currentVote }) => {

    const postRef = useRef<HTMLDivElement>(null)

    return (
        <div className='rounded-md bg-white shadow'>
            <div className='px-6 py-4 flex justify-between'>

                <PostVoteClient postId={post.id} initialVoteAmount={votesAmt} initialVote={currentVote?.type} />

                <div className='w-0 flex-1'>
                    <div className='max-h-40 mt-1 text-xs text-gray-500  '>
                        {
                            subredditName ?
                                <>
                                    <Link className='underline text-zinc-900 text-sm underline-offset-2' href={`/r/${subredditName}`}>
                                        r/{subredditName}
                                    </Link>
                                    <span className='px-1'>.</span>
                                </>
                                :
                                null
                        }

                        <span>Posted by u/{post.author.username}</span> {' '}
                        {formatTimeToNow(new Date(post.createdAt))}
                    </div>

                    <Link href={`/r/${subredditName}/post/${post.id}`}>
                        <h1 className='text-lg font-semibold py-2 loading-6 text-gray-900 '>
                            {post.title}
                        </h1>
                    </Link>

                    <div className="relative text-sm max-h-40 w-full overflow-clip" ref={postRef}>
                        <EditorOutput content={post.content} />
                        {
                            postRef?.current?.clientHeight === 160 ? (
                                <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent" />
                            ) : null
                        }
                    </div>

                </div>
            </div>

            <div className='bg-gray-50 z-20 text-sm p-4 sm:px-6'>
                <Link href={`/r/${subredditName}/post/${post.id}`} className='w-fit flex items-center gap-2 '>
                    <MessageSquare className='w-4 h-4' /> {commentAmount} comments
                </Link>
            </div>

        </div>
    )
}

export default Post