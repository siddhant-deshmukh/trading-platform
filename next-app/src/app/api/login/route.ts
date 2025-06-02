import { post } from "@/lib/apiCallServer";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const { data } = await post('/login', { email, password });
    
    if(data && data.token){
      (await cookies()).set({
        name: 'auth_token_next',           // Name of your cookie
        value: data.token,            // Value of your cookie (e.g., JWT)
        httpOnly: true,              // IMPORTANT: Makes the cookie inaccessible to client-side JavaScript
        secure: process.env.NODE_ENV === 'production', // Use 'secure' in production (HTTPS)
        maxAge: 60 * 60 * 24 * 7,    // Expiration: 1 week (in seconds)
        path: '/',                   // The path the cookie applies to (root in this case)
        sameSite: 'lax',             // CSRF protection: 'strict', 'lax', or 'none'
      });

      return NextResponse.json(data, { status: 200 });
    }
    throw 'error'
  } catch {
    NextResponse.json({msg: `Some error occured`}, { status: 500 });
  }
}