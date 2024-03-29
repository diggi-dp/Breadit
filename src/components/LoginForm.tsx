"use client";

import { signIn } from "next-auth/react";   
import { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";



export const LoginForm = () => {
    const [loading, setLoading] = useState(false);


    const loginUser = async (data: { email: string; password: string }) => {
        try {
            setLoading(true);
            const res = await signIn("credentials", {
                redirect: false,
                email: data.email,
                password: data.password,
            });

            if (res?.error) {
                setLoading(false);
                return toast({
                    title: res.error,
                    description: 'please provide valid credentials.',
                    variant: 'destructive'
                })
            }

            reset()
            setLoading(false);
            
            if (res?.url) {
                window.location.replace('/')
            }

        } catch (error) {
            reset()
            setLoading(false);
            toast({
                title: 'There was a problem',
                description: 'There is an error logging In.',
                variant: 'destructive'
            })
        }
    }


    const { register,reset, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            email: '',
            password: ''
        }
    })


    return (
        <form onSubmit={handleSubmit(data => loginUser(data))}>
            <Input
                required
                placeholder="Email address"
                type="email"
                {...register('email')}
                className="my-4"
            />
            {errors?.email && (
                <p className='px-1 text-xs text-red-600 flex justify-start mt-[-10px]'>{errors.email.message}</p>
            )}

            <Input
                required
                placeholder="password"
                type="password"
                {...register('password')}
                className="my-4"
            />
            {errors?.password && (
                <p className='px-1 text-xs text-red-600 flex justify-start mt-[-10px] '>{errors.password.message}</p>
            )}

            <Button
                size='sm'
                className='w-full mt-4'
                type="submit"
                isLoading={loading}
            >
                Sign In
            </Button>

            <div className="flex items-center my-4 before:flex-1 before:border-t before:border-gray-300 before:mt-0.5 after:flex-1 after:border-t after:border-gray-300 after:mt-0.5">
                <p className="text-center font-semibold mx-4 mb-0">OR</p>
            </div>

        </form>
    );
};
