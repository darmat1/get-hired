import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default async function proxy(request: NextRequest) {
    if (
        request.nextUrl.pathname.startsWith('/api/') ||
        request.nextUrl.pathname.startsWith('/auth/') ||
        request.nextUrl.pathname.startsWith('/_next/') ||
        request.nextUrl.pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    const session = await auth.api.getSession({
        headers: request.headers
    });

    if (
        !session &&
        (
            request.nextUrl.pathname.startsWith('/dashboard') ||
            request.nextUrl.pathname.startsWith('/resume') ||
            request.nextUrl.pathname.startsWith('/ai')
        )
    ) {
        return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
