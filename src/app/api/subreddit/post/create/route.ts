import { getauthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostValidator } from "@/lib/validators/post";
import { z } from "zod";


export async function POST(req: Request) {
    try {
        const session = await getauthSession()


        if (!session?.user) {
            return new Response('Unauthorized', { status: 401 })
        }

        const body = await req.json()
        const { subredditId, title, content } = PostValidator.parse(body)

        const subscriptionExists = await db.subscription.findFirst({
            where: {
                subredditId: subredditId,
                userId: session.user.id
            }
        })

        if (!subscriptionExists) {
            return new Response('Subscribe the post.', { status: 400 })
        }

        await db.post.create({
            data: {
                title,
                content,
                authorId: session.user.id,
                subredditId
            }
        })

        return new Response('OK')


    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response("Invalid resquest data passed.", { status: 422 })
        }
        return new Response("could not post  to subreddit at this time, Please try again later.", { status: 500 })
    }
}