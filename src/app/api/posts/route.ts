import { getauthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

export async function GET(req: Request) {
    const url = new URL(req.url)

    const session = await getauthSession()

    let followedCommunitiesIds: string[] = []

    if (session) {
        const followedCommunities = await db.subscription.findMany({
            where: {
                userId: session?.user?.id,
            },
            include: {
                subreddit: true
            }
        })
        followedCommunitiesIds = followedCommunities.map(({ subreddit }) => subreddit.id)
    }

    try {
        const { limit, page, subredditName } = z.object({
            limit: z.string(),
            page: z.string(),
            subredditName: z.string().nullish().optional()
        }).parse({
            subredditName: url.searchParams.get('subredditName'),
            limit: url.searchParams.get('limit'),
            page: url.searchParams.get('page'),
        })

        let whereClaus = {}

        if (subredditName) {
            whereClaus = {
                subreddit: {
                    name: subredditName
                },
            }
        } else if (session) {
            whereClaus = {
                subreddit: {
                    id: {
                        in: followedCommunitiesIds
                    }
                }
            }
        }

        const posts = await db.post.findMany({
            take: parseInt(limit),
            skip: (parseInt(page) - 1) * parseInt(limit),
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                subreddit: true,
                votes: true,
                author: true,
                comments: true
            },
            where: whereClaus
        })

        return new Response(JSON.stringify(posts))

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Invalid request dtaa passed.', { status: 422 })
        }
        return new Response("could not fetch more posts", { status: 500 })
    }

}