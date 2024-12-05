import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const superRoutes = ['/api/user/[id]/approve', '/api/user/[id]/reject'];
const protectedRoutes = ['/admin/**', '/api/user', '/api/survey/:path*', '/api/groups/:path*'];
const loggedRoutes = ['/user/:path*']
const publicRoutes = ['/login', '/about', '/research', '/api/user/create', '/api/user/[id]'];

export async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.includes(path);
    const isSuperRoutes = superRoutes.includes(path);
    const isLoggedRoutes = loggedRoutes.includes(path);
    const isPublicRoute = publicRoutes.includes(path);
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (isSuperRoutes && token?.role === 'super') {
        return NextResponse.next();
    }

    if (isLoggedRoutes && token) {
        return NextResponse.next();
    }

    if (isPublicRoute) {
        return NextResponse.next();
    }

    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/', req.nextUrl))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/api/user', '/admin/:path*', '/api/user/:path*', '/user/:path*'],
}
