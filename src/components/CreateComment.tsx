"use client"
import { FC, useState } from "react"
import { Label } from "./ui/Label"
import { Textarea } from "./ui/TextArea"
import { Button } from "./ui/Button"
import { useMutation } from "@tanstack/react-query"
import { CommentRequest } from "@/lib/validators/comment"
import axios, { AxiosError } from "axios"
import { useCustomToast } from "@/hooks/use-custom-toast"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface CreateCommentProps {
    postId: string
    replyId?: string
}

const CreateComment: FC<CreateCommentProps> = ({ postId, replyId }) => {

    const [input, setInput] = useState<string>('')
    const { loginToast } = useCustomToast()
    const router = useRouter()

    const { mutate: comment, isLoading } = useMutation({
        mutationFn: async ({ postId, text, replyId }: CommentRequest) => {
            const payload: CommentRequest = {
                postId,
                text,
                replyId
            }

            const { data } = await axios.patch(`/api/subreddit/post/comment`, payload)
            return data
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 401) {
                    return loginToast()
                }
            }
            return toast({
                title: 'Theare was a problem',
                description: 'something went wrong, please try again.',
                variant: 'destructive'
            })
        },
        onSuccess: () => {
            router.refresh()
            setInput('')
        }
    })

    return (
        <div className="grid w-full gap-1.5">
            <Label htmlFor="comment" >Create Comment</Label>
            <div className="mt-2">
                <Textarea
                    id="comment"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="What are your thoughts?"
                    rows={1}
                />

                <div className="mt-2 flex justify-end">
                    <Button
                        isLoading={isLoading}
                        disabled={input.length === 0}
                        onClick={() => comment({ postId, text:input, replyId })}
                    >
                        Post
                    </Button>
                </div>
            </div>
        </div >
    )
}

export default CreateComment