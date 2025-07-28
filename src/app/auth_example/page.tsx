"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function Home() {
    return (
        <>
            <Authenticated>
                <UserButton />
                <Content />
            </Authenticated>
            <Unauthenticated>
                <SignInButton />
            </Unauthenticated>
        </>
    );
}

function Content() {
    const userEmail = useQuery(api.auth_example.getForCurrentUser);
    return <div>Authenticated content: {userEmail}</div>;
}