"use client";

import { signIn } from "next-auth/react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupFormRequest, SignupFormValidator } from "@/lib/validators/signup";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";

type FormData = z.infer<typeof SignupFormValidator>


export const SignupForm = () => {

    const { mutate, isLoading } = useMutation({
        mutationFn: async (form: FormData) => {
            const payload = form
            const { data } = await axios.post('/api/register', payload)
            console.log(data)
            return data
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 409) {
                    return toast({
                        title: 'Email is already taken.',
                        description: 'Please choose another email to create account.',
                        variant: 'destructive',
                    })
                }
            }

            return toast({
                title: 'Something went wrong.',
                description: 'Account was not created. Please try again.',
                variant: 'destructive',
            })
        },
        onSuccess: (variables) => {
            reset()
            signIn('credentials', {
                email: variables.email,
                password: variables.password
            })
        }
    })


    const { register,reset, handleSubmit, formState: { errors } } = useForm<SignupFormRequest>({
        resolver: zodResolver(SignupFormValidator),
        defaultValues: {
            name: '',
            email: '',
            password: ''
        }
    })


    return (
        <form onSubmit={handleSubmit(data => mutate(data))}>
            <Input
                required
                placeholder="Enter your name"
                autoComplete="off"
                type="text"
                {...register('name')}
                className="my-4"
            />
            {
                errors?.name && (
                    <p className='px-1 text-xs text-red-600 flex justify-start mt-[-10px]'>{errors.name.message}</p>
                )
            }

            <Input
                required
                autoComplete="off"
                placeholder="Email address"
                type="email"
                {...register('email')}
                className="my-4"
            />
            {
                errors?.email && (
                    <p className='px-1 text-xs text-red-600 flex justify-start mt-[-10px]'>
                        {errors.email.message === 'Invalid' ? 'Please enter valid email.' : errors.email.message}
                    </p>
                )
            }

            <Input
                required
                placeholder="password"
                type="password"
                {...register('password')}
                autoComplete="off"
                className="my-4"
            />
            {
                errors?.password && (
                    <p className='px-1 text-xs text-red-600 flex justify-start mt-[-10px] '>
                        {errors.password.message === 'Invalid' ? 'Password must contain at least 1 uppercase, lowercase, numeric, and special character' : errors.password.message}
                    </p>
                )
            }

            <Button
                size='sm'
                className='w-full mt-4'
                type="submit"
                isLoading={isLoading}
            >
                Sign Up
            </Button>
        </form >
    );
};
