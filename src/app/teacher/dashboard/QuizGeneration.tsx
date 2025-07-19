
'use client';

import { useState } from 'react';

// Mock data for PDFs uploaded by admin
const mockPdfs = [
  { id: 'pdf1', name: 'Grade 5 - Science - Chapter 1.pdf', class: '5' },
  { id: 'pdf2', name: 'Grade 5 - Science - Chapter 2.pdf', class: '5' },
  { id: 'pdf3', name: 'Grade 6 - History - Chapter 1.pdf', class: '6' },
  { id: 'pdf4', name: 'Grade 4 - Maths - Chapter 3.pdf', class: '4' },
];

// Mock data for a selected PDF's content
const mockPdfContent = `Photosynthesis is a process used by plants, algae, and certain bacteria to convert light energy into chemical energy, through a process that converts carbon dioxide and water into sugars and oxygen. This process is crucial for life on Earth as it produces most of the oxygen in the atmosphere.

The process of photosynthesis is divided into two main stages: the light-dependent reactions and the light-independent reactions (Calvin cycle). The light-dependent reactions, which occur in the thylakoid membranes of chloroplasts, capture energy from sunlight to produce ATP and NADPH. The Calvin cycle, which takes place in the stroma of the chloroplasts, uses the energy from ATP and NADPH to convert carbon dioxide into glucose.`;

// Mock data for AI-generated quiz
const mockQuiz = {
  title: 'Photosynthesis Quiz',
  questions: [
    { id: 'q1', text: 'What is the primary purpose of photosynthesis?', type: 'multiple-choice', options: ['To produce water', 'To convert light energy into chemical energy', 'To consume oxygen'], answer: 'To convert light energy into chemical energy' },
    { id: 'q2', text: 'Where do the light-dependent reactions occur?', type: 'multiple-choice', options: ['Stroma', 'Thylakoid membranes', 'Cytoplasm'], answer: 'Thylakoid membranes' },
    { id: 'q3', text: 'What are the products of the light-dependent reactions?', type: 'short-answer', answer: 'ATP and NADPH' },
  ]
};

export default function QuizGeneration() {
  const [step, setStep] = useState(1); // 1: Select PDF, 2: Select Paragraph, 3: Preview Quiz
  const [selectedClass, setSelectedClass] = useState('5');
  const [selectedPdf, setSelectedPdf] = useState<any>(null);
  const [selectedParagraph, setSelectedParagraph] = useState('');
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);

  const handleGenerateQuiz = () => {
    // Simulate AI generation
    setGeneratedQuiz(mockQuiz);
    setStep(3);
  };

  const handleSendToStudents = () => {
    alert(`Quiz '${generatedQuiz.title}' has been sent to students in Grade ${selectedClass}. (Simulated)`);
    // Reset state
    setStep(1);
    setSelectedPdf(null);
    setSelectedParagraph('');
    setGeneratedQuiz(null);
  };

  return (
    <div>
      {step === 1 && (
        <div className="card">
          <div className="card-header">Step 1: Select Class and Textbook PDF</div>
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="classSelect" className="form-label">Select Class</label>
              <select id="classSelect" className="form-select" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                {['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <h5 className="mt-4">Available PDFs for Grade {selectedClass}</h5>
            <div className="list-group">
              {mockPdfs.filter(p => p.class === selectedClass).map(pdf => (
                <button key={pdf.id} className="list-group-item list-group-item-action" onClick={() => { setSelectedPdf(pdf); setStep(2); }}>
                  {pdf.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && selectedPdf && (
        <div className="card">
          <div className="card-header">Step 2: Select Paragraph from {selectedPdf.name}</div>
          <div className="card-body">
            <p className="text-muted">In a real implementation, this would be an interactive PDF viewer. For now, click the text to 'select' it.</p>
            <div className="p-3 bg-light border rounded" style={{ cursor: 'pointer' }} onClick={() => setSelectedParagraph(mockPdfContent)}>
              <p>{mockPdfContent}</p>
            </div>
            {selectedParagraph && (
              <div className="mt-3 text-center">
                <p className="text-success">Paragraph selected!</p>
                <button className="btn btn-primary" onClick={handleGenerateQuiz}>Generate Quiz from Selection</button>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 3 && generatedQuiz && (
        <div className="card">
          <div className="card-header">Step 3: Preview and Finalize Quiz</div>
          <div className="card-body">
            <h4 className="mb-4">{generatedQuiz.title}</h4>
            {generatedQuiz.questions.map((q: any, index: number) => (
              <div key={q.id} className="mb-3 p-3 border rounded">
                <p><strong>Question {index + 1}:</strong> {q.text}</p>
                {/* Add editing controls here in a real app */}
              </div>
            ))}
            <div className="d-flex justify-content-between mt-4">
                <button className="btn btn-secondary" onClick={() => setStep(2)}>Back to Paragraph Selection</button>
                <button className="btn btn-success" onClick={handleSendToStudents}>Confirm and Send to Students</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
