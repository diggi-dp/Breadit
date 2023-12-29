"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/Command"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Prisma, Subreddit } from "@prisma/client"
import { usePathname, useRouter } from "next/navigation"
import { User, XCircle } from "lucide-react"
import debounce from "lodash.debounce"
import { useOnClickOutside } from "@/hooks/use-on-click-outside"
import Link from "next/link"



const SearchBar = () => {

    const [input, setInput] = useState<string>('')
    const router = useRouter()
    const searchbarRef = useRef(null)
    const pathname = usePathname()

    useEffect(() => {
        setInput('')
    }, [pathname])


    const { data: queryResults, refetch, isFetched, isFetching } = useQuery({
        queryFn: async () => {
            if (!input) {
                return []
            }

            const { data } = await axios.get(`/api/search?q=${input}`)
            return data as (Subreddit & {
                _count: Prisma.SubredditCountOutputType
            })[]
        },
        queryKey: ["search-query"],
        enabled: false
    })


    const request = debounce(() => {
        refetch()
    }, 320)

    const debounceRequest = useCallback(() => {
        request()
    }, [])

    useOnClickOutside(searchbarRef, () => {
        setInput('')
    })


    const currentCommunity = () => {
        const splitPath = pathname.split('/')
        if (splitPath[1] === 'r' && splitPath[2] !== 'create') {
            return (
                <div className="flex flex-row justify-center items-center rounded-3xl px-2 py-1 border bg-neutral-300 cursor-pointer ">
                    <User className="mr-2 h-4 w-4" />
                    <span className="text-sm font-semibold ">r/{splitPath[2]}</span>
                    <span className=" flex justify-center items-center mr-0 ml-1">
                        <XCircle
                            onClick={()=>router.push('/')}
                            className=" h-5 w-5 rounded-[100px] shadow-[0_0_0_0_#fff] hover:shadow-[0_0_0_5px_#fff] transition-all" />
                    </span>
                </div>
            )
        }
    }


    return (
        <Command ref={searchbarRef} className="relative rounded-lg border max-w-lg z-50 overflow-visible">

            <CommandInput
                value={input}
                onValueChange={(text) => {
                    setInput(text)
                    debounceRequest()
                }}
                className="outline-none border-none focus:border-none focus:outline-none ring-0"
                placeholder="Search communities..."
            >
                {currentCommunity()}
            </CommandInput>


            {
                input.length > 0 ? (
                    <CommandList className="absolute bg-white top-full inset-x-0 shadow rounded-b-md">
                        {
                            isFetched && <CommandEmpty>No Results Found.</CommandEmpty>
                        }
                        {
                            (queryResults?.length ?? 0) > 0 ? (
                                <CommandGroup heading='Communities'>
                                    {
                                        queryResults?.map(subreddit => {
                                            return (
                                                <CommandItem onSelect={(e) => {
                                                    router.push(`/r/${e}`)
                                                    router.refresh()
                                                }}
                                                    key={subreddit.id}
                                                    value={subreddit.name}
                                                >
                                                    <User className="mr-2 h-4 w-4" />
                                                    <Link href={`/r/${subreddit.name}`}>r/{subreddit.name}</Link>
                                                </CommandItem>
                                            )
                                        })
                                    }
                                </CommandGroup>
                            )
                                :
                                null
                        }
                    </CommandList>
                )
                    :
                    null
            }
        </Command>
    )
}

export default SearchBar