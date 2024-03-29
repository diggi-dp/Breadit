import PostFeed from "@/components/PostFeed"
import MiniCreatePost from "@/components/ui/MiniCreatePost"
import { INFINITE_SCROLL_RESULT } from "@/config"
import { getauthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"


interface PageProps {
    params: {
        slug: string
    }
}

const page = async ({ params }: PageProps) => {
    const { slug } = params
    const session = await getauthSession()


    const subreddit = await db.subreddit.findFirst({
        where: { name: slug },
        include: {
            posts: {
                include: {
                    author: true,
                    votes: true,
                    comments: true,
                    subreddit: true
                },
                take: INFINITE_SCROLL_RESULT
            }
        }
    })

    if (!subreddit) {
        return notFound()
    }


    return (
        <>
            <h1 className="font-bold text-3xl md:text-4xl h-14">r/{subreddit.name}</h1>
            <MiniCreatePost session={session} />
            {/* todo : show posts on user feed  */}
            <PostFeed initialPosts={subreddit.posts} subredditName={subreddit.name} />

        </>
    )
}

export default page