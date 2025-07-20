
import { NextResponse } from 'next/server';

// Mock database for user settings
const userSettings: { [key: string]: any } = {
    'user123': {
        personalDetails: { name: 'Student Name', email: 'student@example.com', phone: '123-456-7890' },
        whatsappNotifications: true,
        dataVisibility: 'private',
        defaultQuizParams: { timeLimit: 30, numQuestions: 10 },
        questionCategories: [],
        userRoles: [],
        studentGroups: [],
        defaultReportFilters: 'lastMonth',
        dataExportFormat: 'csv',
        theme: 'light',
        fontSize: 'medium',
    },
    'user456': {
        personalDetails: { name: 'Teacher Name', email: 'teacher@example.com', phone: '987-654-3210' },
        whatsappNotifications: true,
        dataVisibility: 'public',
        defaultQuizParams: { timeLimit: 45, numQuestions: 15 },
        questionCategories: ['Math', 'Science'],
        userRoles: [],
        studentGroups: ['Class A', 'Class B'],
        defaultReportFilters: 'lastWeek',
        dataExportFormat: 'pdf',
        theme: 'dark',
        fontSize: 'medium',
    },
    'user789': {
        personalDetails: { name: 'Admin Name', email: 'admin@example.com', phone: '555-123-4567' },
        whatsappNotifications: false,
        dataVisibility: 'public',
        defaultQuizParams: { timeLimit: 60, numQuestions: 20 },
        questionCategories: ['All', 'General Knowledge'],
        userRoles: ['student', 'teacher', 'admin'],
        studentGroups: ['All Students', 'Graduating Class'],
        defaultReportFilters: 'allTime',
        dataExportFormat: 'csv',
        theme: 'dark',
        fontSize: 'large',
    },
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const settings = userSettings[userId];

    if (settings) {
        return NextResponse.json({ success: true, settings });
    } else {
        return NextResponse.json({ success: false, message: 'Settings not found for this user' }, { status: 404 });
    }
}

export async function POST(request: Request) {
    const { userId, settings } = await request.json();

    if (!userId || !settings) {
        return NextResponse.json({ message: 'User ID and settings are required' }, { status: 400 });
    }

    // Update mock database
    userSettings[userId] = { ...userSettings[userId], ...settings };

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
}
