import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Các trang cần xác thực
    const protectedPaths = [
        '/dashboard'
    ];

    // Các trang auth (không cần xác thực)
    const authPaths = ['/auth/login', '/auth/register', '/auth/forgot-password'];

    // Kiểm tra xem có token trong header không (vì localStorage chỉ có ở client)
    const token = request.cookies.get('userToken')?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '');

    // Nếu truy cập trang cần xác thực mà không có token
    if (protectedPaths.some(path => pathname.startsWith(path))) {
        if (!token) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    // Nếu đã đăng nhập mà vẫn truy cập trang auth
    if (authPaths.some(path => pathname.startsWith(path))) {
        if (token) {
            return NextResponse.redirect(new URL('/dashboard/chat', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Áp dụng middleware cho tất cả các route trừ api, _next/static, _next/image, favicon.ico
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};