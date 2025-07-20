
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { phone, password } = await request.json();

    // Mock authentication logic
    if (phone === '1234567890' && password === 'password') {
        // Simulate different roles based on phone number for testing
        let userRole = 'student';
        let userId = 'S123';

        if (phone === '1112223333') {
            userRole = 'teacher';
            userId = 'T456';
        } else if (phone === '9998887777') {
            userRole = 'admin';
            userId = 'A789';
        }

        return NextResponse.json({ success: true, user: { id: userId, role: userRole } });
    } else {
        return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
}
