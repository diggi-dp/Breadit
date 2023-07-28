import SignIn from "@/components/SignIn"
import { buttonVariants } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { FC } from "react"


const Page: FC = () => {
    return (
        <div className="absolute inset-0 ">
            <div className="h-full max-w-2xl mx-auto flex flex-col items-center justify-center gap-20 ">
                <Link className={cn(buttonVariants({ variant: 'ghost' }), 'self-start -mt-10')} href='/'>
                  <ChevronLeft className="mr-2 h-4 w-4" />  Home
                </Link>
        
                <SignIn />
            </div>
        </div>
    )
}

export default Page

