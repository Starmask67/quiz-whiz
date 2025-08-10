import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // In a real implementation, this would check the actual bot status
        // For now, we'll return a mock status
        const botStatus = {
            isRunning: true,
            botInfo: {
                name: 'Quiz Whiz Bot',
                username: 'quiz_whiz_bot',
                status: 'active'
            },
            lastActivity: new Date().toISOString(),
            totalUsers: 0,
            activeQuizzes: 0
        };

        return NextResponse.json({ 
            success: true, 
            botStatus 
        });
    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to get bot status' 
        }, { status: 500 });
    }
}