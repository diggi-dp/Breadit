"use client"

import { useCustomToast } from "@/hooks/use-custom-toast"
import { usePrevious } from "@mantine/hooks"
import { CommentVote, VoteType } from "@prisma/client"
import { FC, useState } from "react"
import { ArrowBigDown, ArrowBigUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMutation } from "@tanstack/react-query"
import { VoteCommentRequest } from "@/lib/validators/vote"
import axios, { AxiosError } from "axios"
import { toast } from "@/hooks/use-toast"
import { Button } from "./ui/Button"


type PartialVote = Pick<CommentVote, 'type'>

interface CommentVotesProps {
    commentId: string
    initialVoteAmount: number
    initialVote?: PartialVote | undefined
}

const CommentVotes: FC<CommentVotesProps> = ({ commentId, initialVoteAmount, initialVote }) => {

    const { loginToast } = useCustomToast()
    const [voteAmt, setVoteAmt] = useState<number>(initialVoteAmount)
    const [currentVote, setCurrentVote] = useState(initialVote)
    const preVote = usePrevious(currentVote)




    const { mutate: vote } = useMutation({
        mutationFn: async (voteType: VoteType) => {
            const payload: VoteCommentRequest = {
                commentId,
                voteType,
            }

            await axios.patch('/api/subreddit/post/comment/vote', payload)
        },
        onError: (err, VoteType) => {
            if (VoteType === 'UP') {
                setVoteAmt(pre => pre - 1)
            } else {
                setVoteAmt(pre => pre + 1)
            }

            //reset the current vote
            setCurrentVote(preVote)

            if (err instanceof AxiosError) {
                if (err.response?.status === 401) {
                    return loginToast()
                }
            }
            return toast({
                title: ' Something went wrong.',
                description: 'Your vote was not registered, Please try again',
                variant: 'destructive'
            })
        },
        onMutate: (type) => {
            if (currentVote?.type === type) {
                setCurrentVote(undefined)
                if (type === 'UP') {
                    setVoteAmt(pre => pre - 1)
                } else if (type === 'DOWN') {
                    setVoteAmt(pre => pre + 1)
                }
            } else {
                setCurrentVote({type})
                if (type === 'UP') {
                    setVoteAmt(pre => pre + (currentVote ? 2 : 1))
                } else if (type === 'DOWN') {
                    setVoteAmt(pre => pre - (currentVote ? 2 : 1))
                }
            }
        }
    })


    return (
        <div className="flex gap-1">
            <Button onClick={() => vote('UP')} size='sm' variant='ghost' aria-label="upvote" >
                <ArrowBigUp className={cn('h-5 w-5 text-zinc-700', {
                    'text-emerald-500 fill-emerald-500': currentVote?.type === 'UP'
                })} />
            </Button>

            <p className="text-center py-2 font-medium text-sm text-zinc-900">{voteAmt}</p>

            <Button onClick={() => vote('DOWN')} size='sm' variant='ghost' aria-label="downvote" >
                <ArrowBigDown className={cn('h-5 w-5 text-zinc-700', {
                    'text-red-500 fill-red-500': currentVote?.type === 'DOWN'
                })} />
            </Button>

        </div>
    )
}

export default CommentVotes