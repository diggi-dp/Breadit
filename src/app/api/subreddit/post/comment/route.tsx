import { getauthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommentValidator } from "@/lib/validators/comment";
import { z } from "zod";


export async function PATCH(req: Request) {
    try {
        const session = await getauthSession()


        if (!session?.user) {
            return new Response('Unauthorized', { status: 401 })
        }

        const body = await req.json()
        const { postId, text, replyId } = CommentValidator.parse(body)

        await db.comment.create({
            data: {
                postId,
                text,
                authorId: session?.user.id,
                replyId
            }
        })

        return new Response("Ok")


    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response("Invalid resquest data passed.", { status: 422 })
        }
        return new Response("could not create comment, Please try again later.", { status: 500 })
    }
}