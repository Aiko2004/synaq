import { NextResponse } from "next/server"
import { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value
    const { pathname } = request.nextUrl

    const authRoutes = ['/login', '/register']
    const protectedRoutes = ['/dashboard']

    if (token && authRoutes.includes(pathname))
        return NextResponse.redirect(new URL('/dashboard', request.url))

    if (!token && protectedRoutes.includes(pathname)) 
        return NextResponse.redirect(new URL('/login', request.url))

    return NextResponse.next()
}


export const config = {
    matcher: ['/login', '/register', '/dashboard/:path*']
}