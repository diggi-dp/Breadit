'use client'

import { FC, useState } from 'react'
import { Button } from './ui/Button'
import { cn } from '@/lib/utils'
import { signIn } from 'next-auth/react'
import { Icons } from './Icons'
import { useToast } from '@/hooks/use-toast'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> { }

const UserAuthForm: FC<UserAuthFormProps> = ({ className, ...props }) => {

    const [loading, setLoading] = useState<boolean>(false)
    const { toast } = useToast()

    const loginWithGoogle = async () => {
        setLoading(true)
        try {
            await signIn('google')
        } catch (error) {
            // tost notification 
            toast({
                title: 'There was a problem',
                description: 'There is an error logging with Google.',
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className={cn('flex justify-center', className)} {...props}>
            <Button
                size='sm'
                className='w-full'
                onClick={loginWithGoogle}
                isLoading={loading}
            >
                {
                    loading ? null : <Icons.google className='h-4 w-4 mr-2 ' />
                }
                Google
            </Button>
        </div>
    )
}

export default UserAuthForm