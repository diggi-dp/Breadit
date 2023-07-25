import { getauthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubredditSubcriptionValidators } from "@/lib/validators/subreddit";
import { z } from "zod";


export async function POST(req: Request) {
    try {
        const session = await getauthSession()


        if (!session?.user) {
            return new Response('Unauthorized', { status: 401 })
        }

        const body = await req.json()
        const { subredditId } = SubredditSubcriptionValidators.parse(body)

        const subscriptionExists = await db.subscription.findFirst({
            where: {
                subredditId: subredditId,
                userId: session.user.id
            }
        })

        if (subscriptionExists) {
            return new Response('You are already subscribed to this subreddit.', { status: 400 })
        }

        await db.subscription.create({
            data: {
                subredditId,
                userId: session.user.id
            }
        })

        return new Response(subredditId)


    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response("Invalid resquest data passed.", { status: 422 })
        }
        return new Response("could not subscribe, please try again later.", { status: 500 })
    }
}