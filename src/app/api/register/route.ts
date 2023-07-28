
import { db } from "@/lib/db";
import { SignupFormValidator } from "@/lib/validators/signup";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const { name, email, password } = SignupFormValidator.parse(body)

        const hashed_password = await hash(password, 12);

        const check_email = await db.user.findFirst({
            where: {
                email
            }
        })

        if (check_email) {
            return new Response('Email is taken', { status: 409 })
        }

        await db.user.create({
            data: {
                name,
                email,
                password: hashed_password,
            },
        });

        return NextResponse.json({
            email,
            password
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response("Invalid data passed.", { status: 422 })
        }
        return new Response("Something went wrong, please try again later.", { status: 500 })
    }
}
