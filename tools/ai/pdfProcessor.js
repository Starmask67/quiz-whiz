// PDF Processing and AI Quiz Generation Tool
const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../database/connection');

class PDFProcessor {
    constructor() {
        this.genAI = null;
        this.model = null;
        this.initializeAI();
    }

    async initializeAI() {
        try {
            const apiKey = process.env.GEMINI_API_KEY || await this.getApiKeyFromDB();
            if (apiKey) {
                this.genAI = new GoogleGenerativeAI(apiKey);
                this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
                console.log('✅ Gemini AI initialized successfully');
            } else {
                console.warn('⚠️ Gemini API key not found. AI features will be disabled.');
            }
        } catch (error) {
            console.error('❌ Failed to initialize Gemini AI:', error.message);
        }
    }

    async getApiKeyFromDB() {
        try {
            const result = await db.query(
                'SELECT setting_value FROM system_settings WHERE setting_key = ?',
                ['gemini_api_key']
            );
            return result[0]?.setting_value || null;
        } catch (error) {
            console.error('Error fetching API key from database:', error.message);
            return null;
        }
    }

    async processPDF(filePath, textbookId) {
        try {
            console.log(`📄 Processing PDF: ${filePath}`);
            
            // Update status to processing
            await db.query(
                'UPDATE textbooks SET extraction_status = ? WHERE id = ?',
                ['processing', textbookId]
            );

            // Read and parse PDF
            const dataBuffer = await fs.readFile(filePath);
            const pdfData = await pdf(dataBuffer);
            
            // Extract basic information
            const extractedText = pdfData.text;
            const pageCount = pdfData.numpages;
            
            // Save extracted text to database
            await db.query(
                'UPDATE textbooks SET extracted_text = ?, page_count = ?, extraction_status = ? WHERE id = ?',
                [extractedText, pageCount, 'completed', textbookId]
            );

            // Create content chunks for better AI processing
            const chunks = this.createContentChunks(extractedText, textbookId);
            await this.saveContentChunks(chunks, textbookId);

            console.log(`✅ PDF processed successfully. Pages: ${pageCount}, Chunks: ${chunks.length}`);
            
            return {
                success: true,
                pageCount,
                textLength: extractedText.length,
                chunksCreated: chunks.length
            };

        } catch (error) {
            console.error('❌ PDF processing failed:', error.message);
            
            // Update status to failed
            await db.query(
                'UPDATE textbooks SET extraction_status = ? WHERE id = ?',
                ['failed', textbookId]
            );
            
            throw error;
        }
    }

    createContentChunks(text, textbookId, chunkSize = 1500) {
        const chunks = [];
        const paragraphs = text.split(/\n\s*\n/);
        let currentChunk = '';
        let chunkIndex = 0;
        let estimatedPage = 1;

        for (const paragraph of paragraphs) {
            if (currentChunk.length + paragraph.length > chunkSize && currentChunk.length > 0) {
                chunks.push({
                    id: db.generateId('CHK'),
                    textbook_id: textbookId,
                    chunk_index: chunkIndex++,
                    page_number: estimatedPage,
                    content: currentChunk.trim(),
                    word_count: currentChunk.trim().split(/\s+/).length
                });
                
                currentChunk = paragraph;
                estimatedPage = Math.floor(chunkIndex * chunkSize / 3000) + 1; // Estimate page
            } else {
                currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
            }
        }

        // Add the last chunk
        if (currentChunk.trim()) {
            chunks.push({
                id: db.generateId('CHK'),
                textbook_id: textbookId,
                chunk_index: chunkIndex,
                page_number: estimatedPage,
                content: currentChunk.trim(),
                word_count: currentChunk.trim().split(/\s+/).length
            });
        }

        return chunks;
    }

    async saveContentChunks(chunks, textbookId) {
        try {
            // First, delete existing chunks for this textbook
            await db.query('DELETE FROM textbook_chunks WHERE textbook_id = ?', [textbookId]);

            // Insert new chunks
            for (const chunk of chunks) {
                await db.query(
                    'INSERT INTO textbook_chunks (id, textbook_id, chunk_index, page_number, content, word_count) VALUES (?, ?, ?, ?, ?, ?)',
                    [chunk.id, chunk.textbook_id, chunk.chunk_index, chunk.page_number, chunk.content, chunk.word_count]
                );
            }

            console.log(`✅ Saved ${chunks.length} content chunks for textbook ${textbookId}`);
        } catch (error) {
            console.error('❌ Failed to save content chunks:', error.message);
            throw error;
        }
    }

    async generateQuiz(chunkId, classLevel, subject, teacherId) {
        if (!this.model) {
            throw new Error('Gemini AI not initialized. Please check your API key.');
        }

        try {
            console.log(`🤖 Generating quiz for chunk: ${chunkId}`);

            // Get the content chunk
            const chunkResult = await db.query(
                'SELECT * FROM textbook_chunks WHERE id = ?',
                [chunkId]
            );

            if (chunkResult.length === 0) {
                throw new Error('Content chunk not found');
            }

            const chunk = chunkResult[0];
            const content = chunk.content;

            // Create AI prompt for quiz generation
            const prompt = this.createQuizPrompt(content, classLevel, subject);
            
            // Generate quiz using Gemini
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const quizText = response.text();

            // Parse the AI response to extract questions
            const questions = this.parseQuizResponse(quizText);

            if (questions.length === 0) {
                throw new Error('No valid questions were generated');
            }

            // Save quiz to database
            const quizId = await this.saveQuizToDatabase(questions, chunkId, classLevel, subject, teacherId);

            console.log(`✅ Quiz generated successfully with ${questions.length} questions`);
            
            return {
                success: true,
                quizId,
                questionsCount: questions.length,
                questions
            };

        } catch (error) {
            console.error('❌ Quiz generation failed:', error.message);
            throw error;
        }
    }

    createQuizPrompt(content, classLevel, subject) {
        return `
You are an expert educator creating a quiz for ${classLevel} grade students studying ${subject}.

Based on the following educational content, generate exactly 10 multiple-choice questions with 4 options each (A, B, C, D).

CONTENT:
${content}

REQUIREMENTS:
1. Generate exactly 10 questions suitable for ${classLevel} grade level
2. Each question should have exactly 4 options (A, B, C, D)
3. Questions should test understanding, not just memorization
4. Include a mix of difficulty levels appropriate for the grade
5. Make sure all questions are directly related to the provided content
6. Provide clear, unambiguous correct answers

FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS:

QUESTION 1:
[Question text here]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
CORRECT: [A/B/C/D]
EXPLANATION: [Brief explanation]

QUESTION 2:
[Question text here]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
CORRECT: [A/B/C/D]
EXPLANATION: [Brief explanation]

[Continue for all 10 questions...]

Make sure to follow this exact format so the questions can be parsed correctly.
        `;
    }

    parseQuizResponse(quizText) {
        const questions = [];
        const questionBlocks = quizText.split(/QUESTION \d+:/);
        
        for (let i = 1; i < questionBlocks.length; i++) {
            try {
                const block = questionBlocks[i].trim();
                const lines = block.split('\n').filter(line => line.trim());
                
                if (lines.length < 6) continue; // Need at least question + 4 options + correct answer
                
                const questionText = lines[0].trim();
                const optionA = lines[1].replace(/^A\)\s*/, '').trim();
                const optionB = lines[2].replace(/^B\)\s*/, '').trim();
                const optionC = lines[3].replace(/^C\)\s*/, '').trim();
                const optionD = lines[4].replace(/^D\)\s*/, '').trim();
                
                const correctLine = lines.find(line => line.startsWith('CORRECT:'));
                const explanationLine = lines.find(line => line.startsWith('EXPLANATION:'));
                
                if (!correctLine) continue;
                
                const correctAnswer = correctLine.replace('CORRECT:', '').trim();
                const explanation = explanationLine ? explanationLine.replace('EXPLANATION:', '').trim() : '';
                
                if (['A', 'B', 'C', 'D'].includes(correctAnswer)) {
                    questions.push({
                        id: db.generateId('Q'),
                        question_number: i,
                        question_text: questionText,
                        option_a: optionA,
                        option_b: optionB,
                        option_c: optionC,
                        option_d: optionD,
                        correct_answer: correctAnswer,
                        explanation: explanation,
                        difficulty_level: this.determineDifficulty(questionText)
                    });
                }
            } catch (error) {
                console.warn(`⚠️ Failed to parse question ${i}:`, error.message);
                continue;
            }
        }
        
        return questions;
    }

    determineDifficulty(questionText) {
        const text = questionText.toLowerCase();
        if (text.includes('analyze') || text.includes('evaluate') || text.includes('compare')) {
            return 'hard';
        } else if (text.includes('explain') || text.includes('describe') || text.includes('why')) {
            return 'medium';
        } else {
            return 'easy';
        }
    }

    async saveQuizToDatabase(questions, chunkId, classLevel, subject, teacherId) {
        try {
            // Get chunk and textbook information
            const chunkResult = await db.query(
                `SELECT tc.*, t.subject_id, t.id as textbook_id 
                 FROM textbook_chunks tc 
                 JOIN textbooks t ON tc.textbook_id = t.id 
                 WHERE tc.id = ?`,
                [chunkId]
            );

            if (chunkResult.length === 0) {
                throw new Error('Chunk not found');
            }

            const chunk = chunkResult[0];
            
            // Get target class information
            const classResult = await db.query(
                'SELECT id FROM classes WHERE class_name = ? LIMIT 1',
                [classLevel]
            );

            if (classResult.length === 0) {
                throw new Error('Class not found');
            }

            const classId = classResult[0].id;

            // Create quiz
            const quizId = db.generateId('QZ');
            const title = `${subject} Quiz - ${new Date().toLocaleDateString()}`;
            
            await db.query(
                `INSERT INTO quizzes (id, title, textbook_id, chunk_id, created_by, target_class_id, 
                 subject_id, total_questions, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [quizId, title, chunk.textbook_id, chunkId, teacherId, classId, chunk.subject_id, questions.length, 'draft']
            );

            // Save questions
            for (const question of questions) {
                await db.query(
                    `INSERT INTO quiz_questions (id, quiz_id, question_number, question_text, 
                     option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty_level) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        question.id, quizId, question.question_number, question.question_text,
                        question.option_a, question.option_b, question.option_c, question.option_d,
                        question.correct_answer, question.explanation, question.difficulty_level
                    ]
                );
            }

            return quizId;

        } catch (error) {
            console.error('❌ Failed to save quiz to database:', error.message);
            throw error;
        }
    }

    async getAvailableChunks(textbookId) {
        try {
            const chunks = await db.query(
                'SELECT id, chunk_index, page_number, LEFT(content, 200) as preview, word_count FROM textbook_chunks WHERE textbook_id = ? ORDER BY chunk_index',
                [textbookId]
            );
            return chunks;
        } catch (error) {
            console.error('Failed to get chunks:', error.message);
            throw error;
        }
    }

    async getTextbooksByClass(classLevel) {
        try {
            const textbooks = await db.query(
                `SELECT t.*, s.name as subject_name 
                 FROM textbooks t 
                 JOIN subjects s ON t.subject_id = s.id 
                 WHERE t.class_level = ? AND t.extraction_status = 'completed'
                 ORDER BY s.name, t.original_name`,
                [classLevel]
            );
            return textbooks;
        } catch (error) {
            console.error('Failed to get textbooks:', error.message);
            throw error;
        }
    }
}

module.exports = new PDFProcessor();