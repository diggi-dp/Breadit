"use client"
import { ExtendedPost } from "@/types/db"
import { FC, useEffect, useRef } from "react"
import { useIntersection } from '@mantine/hooks'
import { useInfiniteQuery } from "@tanstack/react-query"
import { INFINITE_SCROLL_RESULT } from "@/config"
import axios from "axios"
import { useSession } from "next-auth/react"
import Post from "./Post"

interface PostFeedProps {
    initialPosts: ExtendedPost[]
    subredditName?: string
}

const PostFeed: FC<PostFeedProps> = ({ initialPosts, subredditName }) => {

    const lastPostRef = useRef<HTMLElement>(null)

    const { data: session } = useSession()

    const { ref, entry } = useIntersection({
        root: lastPostRef.current,
        threshold: 1
    })

    const { data, fetchNextPage, isFetchingNextPage, hasNextPage } = useInfiniteQuery(
        ['infinite-query'],
        async ({ pageParam = 1 }) => {
            const query =
                `/api/posts?limit=${INFINITE_SCROLL_RESULT}&page=${pageParam}` +
                (!!subredditName ? `&subredditName=${subredditName}` : '')
            const { data } = await axios.get(query)
            return data as ExtendedPost[]
        },
        {
            getNextPageParam: (data, pages) => {
                if (data.length === 0) {
                    return undefined
                }
                return pages.length + 1
            },
            initialData: { pages: [initialPosts], pageParams: [1] }
        }
    )



    useEffect(() => {
        if (entry?.isIntersecting && hasNextPage) {
            fetchNextPage()
        }
    }, [entry, fetchNextPage])

    const posts = data?.pages.flatMap((page) => page) ?? initialPosts


    return (
        <ul className="flex flex-col col-span-2 space-y-6">
            {
                posts.map((post, idx) => {
                    const totalVotes = post.votes?.reduce((acc, vote) => {
                        if (vote.type === 'UP') return acc + 1
                        if (vote.type === 'DOWN') return acc - 1
                        return acc
                    }, 0)

                    const currentVote = post.votes?.find(vote => vote.userId === session?.user.id)

                    if (idx === posts.length - 1) {
                        return (
                            <li key={post.id} ref={ref}>
                                <Post
                                    subredditName={post.subreddit.name}
                                    post={post}
                                    commentAmount={post.comments.length}
                                    votesAmt={totalVotes}
                                    currentVote={currentVote}
                                />
                                {
                                    isFetchingNextPage && <div
                                        className="border-4 border-solid border-x-stone-900 border-opacity-21 
                                            border-b-0  rounded-full w-12 h-12 animate-spin m-auto mt-6 ">
                                    </div>
                                }
                            </li>
                        )
                    } else {
                        return <Post
                            key={post.id}
                            subredditName={post.subreddit.name}
                            post={post}
                            commentAmount={post.comments.length}
                            votesAmt={totalVotes}
                            currentVote={currentVote}
                        />
                    }

                })
            }
        </ul>
    )
}

export default PostFeed