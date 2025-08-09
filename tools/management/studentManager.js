// Student Management System for Quiz Whiz
const db = require('../database/connection');
const telegramBot = require('../bot/telegramBot');

class StudentManager {
    constructor() {
        this.bulkOperationQueue = [];
        this.isProcessingBulk = false;
    }

    // Student Registration and Management
    async registerStudent(studentData) {
        try {
            const {
                name, phone, email, admissionNo, classId, rollNumber,
                parentPhone, parentEmail, dateOfBirth, schoolId, password
            } = studentData;

            // Create user record
            const userId = db.generateId('USR');
            const hashedPassword = await this.hashPassword(password);

            await db.query(
                `INSERT INTO users (id, phone, name, email, role, school_id, password_hash) 
                 VALUES (?, ?, ?, ?, 'student', ?, ?)`,
                [userId, phone, name, email, schoolId, hashedPassword]
            );

            // Create student specific record
            await db.query(
                `INSERT INTO students (user_id, admission_no, class_id, roll_number, 
                 parent_phone, parent_email, date_of_birth) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, admissionNo, classId, rollNumber, parentPhone, parentEmail, dateOfBirth]
            );

            console.log(`✅ Student registered: ${name} (${admissionNo})`);
            
            return {
                success: true,
                userId,
                admissionNo,
                message: 'Student registered successfully'
            };

        } catch (error) {
            console.error('Error registering student:', error.message);
            throw error;
        }
    }

    async bulkRegisterStudents(studentsData, schoolId) {
        try {
            console.log(`📥 Starting bulk registration of ${studentsData.length} students`);
            
            const results = {
                successful: [],
                failed: [],
                duplicates: []
            };

            for (const studentData of studentsData) {
                try {
                    // Check for duplicates
                    const existing = await this.checkDuplicateStudent(studentData.admissionNo, studentData.phone);
                    
                    if (existing) {
                        results.duplicates.push({
                            ...studentData,
                            reason: existing.type
                        });
                        continue;
                    }

                    // Register student
                    const result = await this.registerStudent({
                        ...studentData,
                        schoolId,
                        password: studentData.password || this.generateDefaultPassword()
                    });

                    results.successful.push({
                        ...studentData,
                        userId: result.userId
                    });

                } catch (error) {
                    results.failed.push({
                        ...studentData,
                        error: error.message
                    });
                }
            }

            console.log(`✅ Bulk registration completed: ${results.successful.length} successful, ${results.failed.length} failed, ${results.duplicates.length} duplicates`);
            
            return results;

        } catch (error) {
            console.error('Error in bulk registration:', error.message);
            throw error;
        }
    }

    // Class and Division Management
    async getStudentsByClass(classId, includeInactive = false) {
        try {
            const query = `
                SELECT u.id, u.name, u.phone, u.email, u.telegram_id, u.is_active,
                       s.admission_no, s.roll_number, s.parent_phone, s.parent_email,
                       c.class_name, c.division, c.academic_year
                FROM users u
                JOIN students s ON u.id = s.user_id
                JOIN classes c ON s.class_id = c.id
                WHERE c.id = ? ${includeInactive ? '' : 'AND u.is_active = 1'}
                ORDER BY s.roll_number, u.name
            `;

            const students = await db.query(query, [classId]);
            return students;

        } catch (error) {
            console.error('Error getting students by class:', error.message);
            throw error;
        }
    }

    async getStudentsByClassAndSubject(classId, subjectId, teacherId) {
        try {
            // Verify teacher has access to this class and subject
            const hasAccess = await this.verifyTeacherAccess(teacherId, classId, subjectId);
            if (!hasAccess) {
                throw new Error('Teacher does not have access to this class and subject');
            }

            const students = await this.getStudentsByClass(classId);
            
            // Add performance data for this subject
            for (const student of students) {
                const performance = await this.getStudentPerformance(student.id, subjectId);
                student.performance = performance;
            }

            return students;

        } catch (error) {
            console.error('Error getting students by class and subject:', error.message);
            throw error;
        }
    }

    async getStudentsWithTelegram(classId) {
        try {
            const students = await db.query(
                `SELECT u.id, u.name, u.phone, u.telegram_id,
                        s.admission_no, c.class_name, c.division
                 FROM users u
                 JOIN students s ON u.id = s.user_id
                 JOIN classes c ON s.class_id = c.id
                 WHERE c.id = ? AND u.telegram_id IS NOT NULL AND u.is_active = 1
                 ORDER BY s.roll_number`,
                [classId]
            );

            return students;

        } catch (error) {
            console.error('Error getting students with Telegram:', error.message);
            throw error;
        }
    }

    // Quiz Distribution and Targeting
    async sendQuizToClass(quizId, classId, subjectId, teacherId) {
        try {
            console.log(`🎯 Targeting quiz ${quizId} to class ${classId} for subject ${subjectId}`);

            // Verify teacher permissions
            const hasAccess = await this.verifyTeacherAccess(teacherId, classId, subjectId);
            if (!hasAccess) {
                throw new Error('Access denied: Teacher cannot send quiz to this class/subject');
            }

            // Get eligible students (with Telegram)
            const students = await this.getStudentsWithTelegram(classId);
            
            if (students.length === 0) {
                return {
                    success: false,
                    message: 'No students with Telegram found in this class',
                    totalStudents: 0
                };
            }

            // Send quiz via Telegram bot
            const result = await telegramBot.sendQuizToStudents(quizId, classId, subjectId);
            
            // Log the distribution
            await this.logQuizDistribution(quizId, classId, students.length, teacherId);

            return {
                ...result,
                classInfo: await this.getClassInfo(classId),
                studentsTargeted: students.length
            };

        } catch (error) {
            console.error('Error sending quiz to class:', error.message);
            throw error;
        }
    }

    async sendQuizToSelectedStudents(quizId, studentIds, teacherId) {
        try {
            console.log(`🎯 Targeting quiz ${quizId} to ${studentIds.length} selected students`);

            // Verify all students exist and get their details
            const students = await this.getStudentsByIds(studentIds);
            
            if (students.length !== studentIds.length) {
                throw new Error('Some students not found');
            }

            // Verify teacher has access to all these students
            for (const student of students) {
                const hasAccess = await this.verifyTeacherStudentAccess(teacherId, student.id);
                if (!hasAccess) {
                    throw new Error(`Access denied for student: ${student.name}`);
                }
            }

            // Filter students with Telegram
            const telegramStudents = students.filter(s => s.telegram_id);
            
            if (telegramStudents.length === 0) {
                return {
                    success: false,
                    message: 'None of the selected students have Telegram registered',
                    totalStudents: students.length
                };
            }

            // Send quiz to each student individually
            let successCount = 0;
            let failureCount = 0;

            for (const student of telegramStudents) {
                try {
                    const quiz = await telegramBot.getQuizDetails(quizId);
                    await telegramBot.startQuizForStudent(student, quiz);
                    successCount++;
                } catch (error) {
                    console.error(`Failed to send quiz to ${student.name}:`, error.message);
                    failureCount++;
                }
            }

            // Log the distribution
            await this.logQuizDistribution(quizId, null, students.length, teacherId, 'selected_students');

            return {
                success: true,
                totalStudents: students.length,
                studentsWithTelegram: telegramStudents.length,
                successCount,
                failureCount
            };

        } catch (error) {
            console.error('Error sending quiz to selected students:', error.message);
            throw error;
        }
    }

    // Performance Tracking and Analytics
    async getStudentPerformance(studentId, subjectId = null, classId = null) {
        try {
            let query = `
                SELECT pa.*, s.name as subject_name, c.class_name, c.division
                FROM performance_analytics pa
                JOIN subjects s ON pa.subject_id = s.id
                JOIN classes c ON pa.class_id = c.id
                WHERE pa.student_id = ?
            `;
            const params = [studentId];

            if (subjectId) {
                query += ' AND pa.subject_id = ?';
                params.push(subjectId);
            }

            if (classId) {
                query += ' AND pa.class_id = ?';
                params.push(classId);
            }

            query += ' ORDER BY pa.updated_at DESC';

            const performance = await db.query(query, params);
            return performance;

        } catch (error) {
            console.error('Error getting student performance:', error.message);
            throw error;
        }
    }

    async getClassPerformanceOverview(classId, subjectId = null) {
        try {
            let query = `
                SELECT 
                    COUNT(DISTINCT pa.student_id) as total_students,
                    AVG(pa.average_score) as class_average,
                    MAX(pa.best_score) as highest_score,
                    MIN(pa.worst_score) as lowest_score,
                    SUM(pa.total_quizzes_taken) as total_quizzes_taken,
                    s.name as subject_name
                FROM performance_analytics pa
                JOIN subjects s ON pa.subject_id = s.id
                WHERE pa.class_id = ?
            `;
            const params = [classId];

            if (subjectId) {
                query += ' AND pa.subject_id = ?';
                params.push(subjectId);
            }

            query += ' GROUP BY pa.subject_id ORDER BY s.name';

            const overview = await db.query(query, params);
            return overview;

        } catch (error) {
            console.error('Error getting class performance overview:', error.message);
            throw error;
        }
    }

    async getStudentRankings(classId, subjectId, limit = 10) {
        try {
            const rankings = await db.query(
                `SELECT 
                    u.name, s.admission_no, pa.average_score, pa.total_quizzes_taken,
                    RANK() OVER (ORDER BY pa.average_score DESC) as rank_position
                 FROM performance_analytics pa
                 JOIN students s ON pa.student_id = s.user_id
                 JOIN users u ON s.user_id = u.id
                 WHERE pa.class_id = ? AND pa.subject_id = ?
                 ORDER BY pa.average_score DESC
                 LIMIT ?`,
                [classId, subjectId, limit]
            );

            return rankings;

        } catch (error) {
            console.error('Error getting student rankings:', error.message);
            throw error;
        }
    }

    // Utility Methods
    async verifyTeacherAccess(teacherId, classId, subjectId) {
        try {
            const result = await db.query(
                `SELECT COUNT(*) as count FROM teacher_classes 
                 WHERE teacher_id = ? AND class_id = ? AND subject = (
                     SELECT name FROM subjects WHERE id = ?
                 )`,
                [teacherId, classId, subjectId]
            );

            return result[0].count > 0;

        } catch (error) {
            console.error('Error verifying teacher access:', error.message);
            return false;
        }
    }

    async verifyTeacherStudentAccess(teacherId, studentId) {
        try {
            const result = await db.query(
                `SELECT COUNT(*) as count FROM teacher_classes tc
                 JOIN students s ON tc.class_id = s.class_id
                 WHERE tc.teacher_id = ? AND s.user_id = ?`,
                [teacherId, studentId]
            );

            return result[0].count > 0;

        } catch (error) {
            console.error('Error verifying teacher-student access:', error.message);
            return false;
        }
    }

    async checkDuplicateStudent(admissionNo, phone) {
        try {
            const admissionCheck = await db.query(
                'SELECT admission_no FROM students WHERE admission_no = ?',
                [admissionNo]
            );

            if (admissionCheck.length > 0) {
                return { type: 'admission_number', value: admissionNo };
            }

            const phoneCheck = await db.query(
                'SELECT phone FROM users WHERE phone = ?',
                [phone]
            );

            if (phoneCheck.length > 0) {
                return { type: 'phone_number', value: phone };
            }

            return null;

        } catch (error) {
            console.error('Error checking duplicates:', error.message);
            throw error;
        }
    }

    async getStudentsByIds(studentIds) {
        try {
            if (studentIds.length === 0) return [];

            const placeholders = studentIds.map(() => '?').join(',');
            const students = await db.query(
                `SELECT u.*, s.admission_no, s.class_id, c.class_name, c.division
                 FROM users u
                 JOIN students s ON u.id = s.user_id
                 JOIN classes c ON s.class_id = c.id
                 WHERE u.id IN (${placeholders})`,
                studentIds
            );

            return students;

        } catch (error) {
            console.error('Error getting students by IDs:', error.message);
            throw error;
        }
    }

    async getClassInfo(classId) {
        try {
            const result = await db.query(
                'SELECT c.*, sc.name as school_name FROM classes c JOIN schools sc ON c.school_id = sc.id WHERE c.id = ?',
                [classId]
            );

            return result[0] || null;

        } catch (error) {
            console.error('Error getting class info:', error.message);
            throw error;
        }
    }

    async logQuizDistribution(quizId, classId, studentCount, teacherId, distributionType = 'class') {
        try {
            await db.query(
                `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, new_values) 
                 VALUES (?, ?, 'quiz_distributed', 'quiz', ?, ?)`,
                [
                    db.generateId('LOG'),
                    teacherId,
                    quizId,
                    JSON.stringify({
                        classId,
                        studentCount,
                        distributionType,
                        timestamp: new Date().toISOString()
                    })
                ]
            );

        } catch (error) {
            console.error('Error logging quiz distribution:', error.message);
        }
    }

    generateDefaultPassword() {
        return 'quiz' + Math.random().toString(36).substr(2, 6);
    }

    async hashPassword(password) {
        // In production, use proper password hashing like bcrypt
        // For now, using a simple approach
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    // Search and Filter Methods
    async searchStudents(searchQuery, classId = null, schoolId = null) {
        try {
            let query = `
                SELECT u.id, u.name, u.phone, u.email, u.telegram_id, u.is_active,
                       s.admission_no, s.roll_number, c.class_name, c.division
                FROM users u
                JOIN students s ON u.id = s.user_id
                JOIN classes c ON s.class_id = c.id
                WHERE u.role = 'student' AND (
                    u.name LIKE ? OR 
                    s.admission_no LIKE ? OR 
                    u.phone LIKE ?
                )
            `;
            const params = [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`];

            if (classId) {
                query += ' AND s.class_id = ?';
                params.push(classId);
            }

            if (schoolId) {
                query += ' AND u.school_id = ?';
                params.push(schoolId);
            }

            query += ' ORDER BY u.name LIMIT 50';

            const students = await db.query(query, params);
            return students;

        } catch (error) {
            console.error('Error searching students:', error.message);
            throw error;
        }
    }

    async getStudentsWithoutTelegram(classId = null) {
        try {
            let query = `
                SELECT u.id, u.name, u.phone, s.admission_no, c.class_name, c.division
                FROM users u
                JOIN students s ON u.id = s.user_id
                JOIN classes c ON s.class_id = c.id
                WHERE u.role = 'student' AND u.telegram_id IS NULL AND u.is_active = 1
            `;
            const params = [];

            if (classId) {
                query += ' AND s.class_id = ?';
                params.push(classId);
            }

            query += ' ORDER BY c.class_name, c.division, u.name';

            const students = await db.query(query, params);
            return students;

        } catch (error) {
            console.error('Error getting students without Telegram:', error.message);
            throw error;
        }
    }
}

module.exports = new StudentManager();