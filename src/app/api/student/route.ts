
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const admissionNo = searchParams.get('admissionNo');

    if (!admissionNo) {
        return NextResponse.json({ message: 'Admission number is required' }, { status: 400 });
    }

    // Mock student data
    const mockStudentData: { [key: string]: any } = {
        'S123': {
            name: 'Alen',
            admissionNo: 'S123',
            averageScore: 85,
            totalQuizzes: 20,
            rank: 5,
            recentQuizzes: [
                { name: 'Math Quiz 1', score: 80 },
                { name: 'Science Quiz 1', score: 90 },
                { name: 'History Quiz 1', score: 75 },
            ],
            performanceData: [60, 75, 80, 85, 90],
            subjectData: {
                labels: ['Math', 'Science', 'History', 'English', 'Art'],
                scores: [80, 90, 75, 88, 92],
            },
        },
        'S124': {
            name: 'Bob',
            admissionNo: 'S124',
            averageScore: 70,
            totalQuizzes: 15,
            rank: 10,
            recentQuizzes: [
                { name: 'Math Quiz 1', score: 65 },
                { name: 'Science Quiz 1', score: 75 },
                { name: 'History Quiz 1', score: 60 },
            ],
            performanceData: [50, 60, 70, 75, 70],
            subjectData: {
                labels: ['Math', 'Science', 'History', 'English', 'Art'],
                scores: [65, 75, 60, 70, 80],
            },
        },
    };

    const student = mockStudentData[admissionNo];

    if (student) {
        return NextResponse.json({ success: true, student });
    } else {
        return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });
    }
}
