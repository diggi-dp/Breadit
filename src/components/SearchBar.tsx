"use client"
import { FC, useCallback, useEffect, useRef, useState } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/Command"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Prisma, Subreddit } from "@prisma/client"
import { usePathname, useRouter } from "next/navigation"
import { User } from "lucide-react"
import debounce from "lodash.debounce"
import { useOnClickOutside } from "@/hooks/use-on-click-outside"



const SearchBar = () => {

    const [input, setInput] = useState<string>('')
    const router = useRouter()
    const searchbarRef = useRef(null)
    const pathname = usePathname()

    useEffect(()=>{
        setInput('')
    },[pathname])


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
            />

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
                                                    <a href={`/r/${subreddit.name}`}>r/{subreddit.name}</a>
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