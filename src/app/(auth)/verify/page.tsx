import { db } from '@/lib/db'
import { verifyToken } from '../../../lib/validators/token'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { redirect } from 'next/navigation'


interface VerifyPageProps {
    searchParams: {
        token: string
    }
}

const VerifyPage = async ({ searchParams: { token } }: VerifyPageProps) => {
    if (!token) {
        redirect('/')
    }
    const res = await varifyWithCredentials(token)

    return (
        <div className="absolute inset-0 ">
            <div className="h-full max-w-2xl mx-auto flex flex-col items-center justify-start mt-[180px] gap-10 ">
                <h2 className='text-lime-700 text-2xl font-bold'>{res?.msg}</h2>
                <p className='text-zinc-700 text-sm mb-1  font-medium'>Please sign-in now.</p>
                <Link className={cn(buttonVariants({ variant: 'default' }), 'self-center -mt-5')} href='/sign-in'>
                    Sign In
                </Link>
            </div>
        </div>
    )
}

export default VerifyPage;


const varifyWithCredentials = async (token: string) => {
    const user: any = verifyToken(token)

    const userExist = await db.user.findFirst({
        where: {
            email: user?.email
        }
    })

    if (userExist) {
        return { msg: 'Verification Success!!!' }
    }

    await db.user.create({
        data: {
            name: user?.name,
            email: user?.email,
            password: user?.password
        }
    });

    return { msg: 'Verification Success!!!' }

}