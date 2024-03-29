"use client"

import { FC, useCallback, useEffect, useRef, useState } from "react"
import TextareaAutosize from 'react-textarea-autosize'
import { useForm } from 'react-hook-form'
import { PostCreationRequest, PostValidator } from "@/lib/validators/post"
import { zodResolver } from '@hookform/resolvers/zod'
import EditorJS from "@editorjs/editorjs"
import { uploadFiles } from "@/lib/uploadthing"
import { toast } from "@/hooks/use-toast"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "./ui/Button"

interface EditorProps {
    subredditId: string
}

const Editor: FC<EditorProps> = ({ subredditId }) => {

    const ref = useRef<EditorJS>()
    const [isMount, setIsMount] = useState<boolean>(false)
    const _titleRef = useRef<HTMLTextAreaElement>(null)
    const pathname = usePathname()
    const router = useRouter()


    const { register, handleSubmit, formState: { errors } } = useForm<PostCreationRequest>({
        resolver: zodResolver(PostValidator),
        defaultValues: {
            subredditId,
            title: '',
            content: null
        }
    })

    // editor initilizer
    const initializeEditor = useCallback(async () => {
        const EditorJs = (await import('@editorjs/editorjs')).default
        const Header = (await import('@editorjs/header')).default
        const Embed = (await import('@editorjs/embed')).default
        const Table = (await import('@editorjs/table')).default
        const List = (await import('@editorjs/list')).default
        const Code = (await import('@editorjs/code')).default
        const LinkTool = (await import('@editorjs/link')).default
        const InlineCode = (await import('@editorjs/inline-code')).default
        const ImageTool = (await import('@editorjs/image')).default

        if (!ref.current) {
            const editor = new EditorJS({
                holder: 'editor',
                onReady() {
                    ref.current = editor
                },
                placeholder: 'Type here to write your post...',
                inlineToolbar: true,
                data: { blocks: [] },
                tools: {
                    header: Header,
                    LinkTool: {
                        class: LinkTool,
                        config: {
                            endpoint: '/api/link',
                        }
                    },
                    image: {
                        class: ImageTool,
                        config: {
                            uploader: {
                                async uploadByFile(file: File) {
                                    const [res] = await uploadFiles([file], 'imageUploader')
                                    return {
                                        success: 1,
                                        file: {
                                            url: res.fileUrl
                                        }
                                    }
                                }
                            }
                        }
                    },
                    list: List,
                    code: Code,
                    inlineCode: InlineCode,
                    table: Table,
                    embed: Embed,
                }
            })
        }


    }, [])

    //set component is mount or not
    useEffect(() => {
        if (typeof window !== undefined) {
            setIsMount(true)
        }
    }, [])

    // handle error from useForm hook
    useEffect(() => {
        if (Object.keys(errors).length) {
            for (let [_key, value] of Object.entries(errors)) {
                toast({
                    title: 'Something went wrong',
                    description: (value as ({ message: string })).message,
                    variant: 'destructive'
                })
            }
        }
    }, [errors])

    //for initilize editor and focus title when component mount
    useEffect(() => {
        const init = async () => {
            await initializeEditor()

            setTimeout(() => {
                _titleRef.current?.focus()  //set focus to title
            }, 0)
        }

        if (isMount) {
            init()

            return () => {
                ref.current?.destroy()
                ref.current = undefined
            }
        }

    }, [isMount, initializeEditor])


    // use query for api call
    const { mutate: createPost, isLoading } = useMutation({
        mutationFn: async ({ title, content, subredditId }: PostCreationRequest) => {
            const payload: PostCreationRequest = {
                title, content, subredditId
            }

            const { data } = await axios.post('/api/subreddit/post/create', payload)
            return data
        },
        onError: (err) => {
            return toast({
                title: 'Something went wrong.',
                description: 'Your post was not published, please try again later.',
                variant: 'destructive'
            })
        },
        onSuccess: () => {
            // r/mycummunity/submit  into r/mycummunity
            const newPathName = pathname.split('/').slice(0, -1).join('/')
            router.push(newPathName)
            router.refresh()
            return toast({
                description: 'Your post has been published.'
            })
        }
    })

    //form submit api call
    async function onSubmit(data: PostCreationRequest) {
        const blocks = await ref.current?.save()

        const payload: PostCreationRequest = {
            title: data.title,
            content: blocks,
            subredditId
        }

        createPost(payload)
    }

    //destructure textarea's ref
    const { ref: titleRef, ...rest } = register('title')


    return (
        <>
            <div className="w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200 ">
                <form id='subreddit-post-form' className="w-full" onSubmit={handleSubmit(onSubmit)}>
                    <div className="prose prose-stone dark:prose-invert ">
                        <TextareaAutosize
                            ref={(e) => {
                                titleRef(e)
                                //@ts-ignore
                                _titleRef.current = e
                            }}
                            {...rest}
                            placeholder="Title"
                            className="w-full resize-none appearance-none overflow-hidden bg-transparent text:5xl font-bold focus:outline-none "
                        />

                        <div id="editor" className="min-h-[350px]" />
                    </div>
                </form>
            </div>
            <div className="w-full flex justify-end">
                <Button isLoading={isLoading} type="submit" className="w-full" form='subreddit-post-form'>Post</Button>
            </div>
        </>
    )
}

export default Editor   