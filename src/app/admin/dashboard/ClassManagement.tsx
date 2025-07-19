'use client';

import { useState, useMemo } from 'react';

// Mock data - in a real app, this would come from your database
const mockInitialTeachers = [
  { id: 'T01', name: 'Jane Smith' },
  { id: 'T02', name: 'John Doe' },
];

const mockInitialStudents = [
  { id: 'S001', name: 'Alice Johnson' },
  { id: 'S002', name: 'Bob Williams' },
  { id: 'S003', name: 'Charlie Brown' },
  { id: 'S004', name: 'Diana Miller' },
  { id: 'S005', name: 'Eve Davis' },
];

const mockInitialClasses = [
  { id: 'C01', name: 'Grade 5 - Section A', teacherId: 'T01', studentIds: ['S001', 'S003'] },
  { id: 'C02', name: 'Grade 5 - Section B', teacherId: 'T02', studentIds: ['S002', 'S004'] },
];

export default function ClassManagement() {
  const [classes, setClasses] = useState(mockInitialClasses);
  const [students, setStudents] = useState(mockInitialStudents);
  const [teachers, setTeachers] = useState(mockInitialTeachers);

  const [editingClass, setEditingClass] = useState<any>(null);
  const [newClassName, setNewClassName] = useState('');
  const [assignedTeacherId, setAssignedTeacherId] = useState('');

  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);

  const handleCreateOrUpdateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName || !assignedTeacherId) {
      alert('Please provide a class name and assign a teacher.');
      return;
    }

    if (editingClass) {
      // Update existing class
      setClasses(classes.map(c => 
        c.id === editingClass.id ? { ...c, name: newClassName, teacherId: assignedTeacherId } : c
      ));
      alert('Class updated successfully!');
    } else {
      // Create new class
      const newClass = {
        id: `C${Date.now()}`,
        name: newClassName,
        teacherId: assignedTeacherId,
        studentIds: [],
      };
      setClasses([...classes, newClass]);
      alert('Class created successfully!');
    }

    // Reset form
    setEditingClass(null);
    setNewClassName('');
    setAssignedTeacherId('');
  };

  const handleEditClick = (classToEdit: any) => {
    setEditingClass(classToEdit);
    setNewClassName(classToEdit.name);
    setAssignedTeacherId(classToEdit.teacherId);
  };

  const handleDeleteClick = (classId: string) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      setClasses(classes.filter(c => c.id !== classId));
    }
  };

  const handleManageEnrollmentClick = (classInfo: any) => {
    setSelectedClass(classInfo);
    setShowEnrollModal(true);
  };

  const handleToggleEnrollment = (studentId: string) => {
    if (!selectedClass) return;

    const isEnrolled = selectedClass.studentIds.includes(studentId);
    const updatedStudentIds = isEnrolled
      ? selectedClass.studentIds.filter((id: string) => id !== studentId)
      : [...selectedClass.studentIds, studentId];

    const updatedClass = { ...selectedClass, studentIds: updatedStudentIds };
    setSelectedClass(updatedClass);
    setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c));
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h3>Class & School Management</h3>

      {/* Create/Edit Class Form */}
      <div className="card mb-4">
        <div className="card-header">{editingClass ? 'Edit Class' : 'Create New Class'}</div>
        <div className="card-body">
          <form onSubmit={handleCreateOrUpdateClass}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="className" className="form-label">Class Name</label>
                <input type="text" className="form-control" id="className" placeholder="e.g., Grade 5 - Section A" value={newClassName} onChange={e => setNewClassName(e.target.value)} />
              </div>
              <div className="col-md-6">
                <label htmlFor="classTeacher" className="form-label">Assign Teacher</label>
                <select className="form-select" id="classTeacher" value={assignedTeacherId} onChange={e => setAssignedTeacherId(e.target.value)}>
                  <option value="">Select a Teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary me-2">{editingClass ? 'Update Class' : 'Create Class'}</button>
            {editingClass && <button type="button" className="btn btn-secondary" onClick={() => { setEditingClass(null); setNewClassName(''); setAssignedTeacherId(''); }}>Cancel Edit</button>}
          </form>
        </div>
      </div>

      {/* Existing Classes Table */}
      <div className="card">
        <div className="card-header">Existing Classes</div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th>Teacher</th>
                  <th>Enrolled Students</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map(c => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{teacherMap.get(c.teacherId) || 'N/A'}</td>
                    <td>{c.studentIds.length}</td>
                    <td>
                      <button className="btn btn-sm btn-info me-2" onClick={() => handleManageEnrollmentClick(c)}>Manage Enrollment</button>
                      <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditClick(c)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteClick(c.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Student Enrollment Modal */}
      {showEnrollModal && selectedClass && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Manage Enrollment for {selectedClass.name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowEnrollModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search for students to add..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="list-group" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {filteredStudents.map(student => {
                    const isEnrolled = selectedClass.studentIds.includes(student.id);
                    return (
                      <div key={student.id} className="list-group-item d-flex justify-content-between align-items-center">
                        {student.name}
                        <button 
                          className={`btn btn-sm ${isEnrolled ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => handleToggleEnrollment(student.id)}
                        >
                          {isEnrolled ? 'Unenroll' : 'Enroll'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEnrollModal(false)}>Done</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}