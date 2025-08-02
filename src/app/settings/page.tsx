
'use client';

import { useState, useEffect } from 'react';

// Mock authentication hook (replace with your actual auth context)
const useAuth = () => {
    const [user, setUser] = useState<{ role: string; id: string } | null>(null);

    useEffect(() => {
        // Simulate fetching user role from an API or context
        // For demonstration, hardcode a role and user ID.
        // In a real app, this comes from your auth system after login.
        const mockUser = {
            role: 'admin', // 'student', 'teacher', 'admin'
            id: 'user789', // Corresponds to mock data in /api/settings
        };
        setUser(mockUser);
    }, []);

    return user;
};

export default function SettingsPage() {
    const user = useAuth();
    const [personalDetails, setPersonalDetails] = useState({
        name: '', email: '', phone: ''
    });
    const [whatsappNotifications, setWhatsappNotifications] = useState(false);
    const [dataVisibility, setDataVisibility] = useState('public');
    const [defaultQuizParams, setDefaultQuizParams] = useState({
        timeLimit: 30, numQuestions: 10
    });
    const [questionCategories, setQuestionCategories] = useState<string[]>([]);
    const [userRoles, setUserRoles] = useState<string[]>([]); // Mock for managing roles
    const [studentGroups, setStudentGroups] = useState<string[]>([]); // Mock for managing groups
    const [defaultReportFilters, setDefaultReportFilters] = useState('lastMonth');
    const [dataExportFormat, setDataExportFormat] = useState('csv');
    const [theme, setTheme] = useState('light');
    const [fontSize, setFontSize] = useState('medium');

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'danger' | '' }>({ text: '', type: '' });

    useEffect(() => {
        const fetchSettings = async () => {
            if (user && user.id) {
                const response = await fetch(`/api/settings?userId=${user.id}`);
                const data = await response.json();
                if (data.success) {
                    const settings = data.settings;
                    setPersonalDetails(settings.personalDetails);
                    setWhatsappNotifications(settings.whatsappNotifications);
                    setDataVisibility(settings.dataVisibility);
                    setDefaultQuizParams(settings.defaultQuizParams);
                    setQuestionCategories(settings.questionCategories);
                    setUserRoles(settings.userRoles);
                    setStudentGroups(settings.studentGroups);
                    setDefaultReportFilters(settings.defaultReportFilters);
                    setDataExportFormat(settings.dataExportFormat);
                    setTheme(settings.theme);
                    setFontSize(settings.fontSize);
                } else {
                    console.error('Failed to fetch settings:', data.message);
                    setMessage({ text: 'Failed to load settings.', type: 'danger' });
                }
            }
        };
        fetchSettings();
    }, [user]);

    const handleSave = async () => {
        if (!user || !user.id) return;

        setIsLoading(true);
        setMessage({ text: '', type: '' }); // Clear previous messages

        const settingsToSave = {
            personalDetails,
            whatsappNotifications,
            dataVisibility,
            defaultQuizParams,
            questionCategories,
            userRoles,
            studentGroups,
            defaultReportFilters,
            dataExportFormat,
            theme,
            fontSize,
        };

        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user.id, settings: settingsToSave }),
            });
            const data = await response.json();
            if (data.success) {
                setMessage({ text: 'Settings saved successfully!', type: 'success' });
            } else {
                setMessage({ text: 'Failed to save settings: ' + data.message, type: 'danger' });
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ text: 'An unexpected error occurred.', type: 'danger' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return <div>Loading settings...</div>;
    }

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Settings</h1>

            {message.text && (
                <div className={`alert alert-${message.type}`} role="alert">
                    {message.text}
                </div>
            )}

            {/* Profile Settings */}
            <section className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--gray-200)', fontWeight: '600', color: 'var(--gray-700)' }}>Profile Settings</div>
                <div className="card-body">
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">Name</label>
                        <input type="text" className="form-control" id="name" value={personalDetails.name} onChange={(e) => setPersonalDetails({ ...personalDetails, name: e.target.value })} />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input type="email" className="form-control" id="email" value={personalDetails.email} onChange={(e) => setPersonalDetails({ ...personalDetails, email: e.target.value })} />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="phone" className="form-label">Phone</label>
                        <input type="tel" className="form-control" id="phone" value={personalDetails.phone} onChange={(e) => setPersonalDetails({ ...personalDetails, phone: e.target.value })} />
                    </div>
                </div>
            </section>

            {/* Notification Preferences */}
            <section className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--gray-200)', fontWeight: '600', color: 'var(--gray-700)' }}>Notification Preferences</div>
                <div className="card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input 
                            type="checkbox" 
                            id="whatsappNotifications" 
                            checked={whatsappNotifications} 
                            onChange={(e) => setWhatsappNotifications(e.target.checked)}
                            style={{ width: '1.25rem', height: '1.25rem' }}
                        />
                        <label htmlFor="whatsappNotifications" style={{ margin: 0 }}>Receive WhatsApp Notifications</label>
                    </div>
                </div>
            </section>

            {/* Privacy Settings */}
            <section className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--gray-200)', fontWeight: '600', color: 'var(--gray-700)' }}>Privacy Settings</div>
                <div className="card-body">
                    <div className="mb-3">
                        <label htmlFor="dataVisibility" className="form-label">Data Visibility</label>
                        <select className="form-select" id="dataVisibility" value={dataVisibility} onChange={(e) => setDataVisibility(e.target.value)}>
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                    </div>
                    <button className="btn btn-danger">Delete Account</button>
                </div>
            </section>

            {/* Quiz Management Settings (Teacher/Admin) */}
            {(user.role === 'teacher' || user.role === 'admin') && (
                <section className="card" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--gray-200)', fontWeight: '600', color: 'var(--gray-700)' }}>Quiz Management Settings</div>
                    <div className="card-body">
                        <div className="mb-3">
                            <label htmlFor="timeLimit" className="form-label">Default Time Limit (minutes)</label>
                            <input type="number" className="form-control" id="timeLimit" value={defaultQuizParams.timeLimit} onChange={(e) => setDefaultQuizParams({ ...defaultQuizParams, timeLimit: parseInt(e.target.value) })} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="numQuestions" className="form-label">Default Number of Questions</label>
                            <input type="number" className="form-control" id="numQuestions" value={defaultQuizParams.numQuestions} onChange={(e) => setDefaultQuizParams({ ...defaultQuizParams, numQuestions: parseInt(e.target.value) })} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="questionCategories" className="form-label">Question Categories (comma-separated)</label>
                            <input type="text" className="form-control" id="questionCategories" value={questionCategories.join(', ')} onChange={(e) => setQuestionCategories(e.target.value.split(',').map(cat => cat.trim()))} />
                        </div>
                    </div>
                </section>
            )}

            {/* User Management (Admin/Teacher) */}
            {(user.role === 'admin' || user.role === 'teacher') && (
                <section className="card" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--gray-200)', fontWeight: '600', color: 'var(--gray-700)' }}>User Management</div>
                    <div className="card-body">
                        {user.role === 'admin' && (
                            <div className="mb-3">
                                <label htmlFor="userRoles" className="form-label">Manage User Roles (comma-separated)</label>
                                <input type="text" className="form-control" id="userRoles" value={userRoles.join(', ')} onChange={(e) => setUserRoles(e.target.value.split(',').map(role => role.trim()))} />
                            </div>
                        )}
                        <div className="mb-3">
                            <label htmlFor="studentGroups" className="form-label">Student Groups (comma-separated)</label>
                            <input type="text" className="form-control" id="studentGroups" value={studentGroups.join(', ')} onChange={(e) => setStudentGroups(e.target.value.split(',').map(group => group.trim()))} />
                        </div>
                    </div>
                </section>
            )}

            {/* Reporting & Analytics Preferences (Teacher/Admin) */}
            {(user.role === 'teacher' || user.role === 'admin') && (
                <section className="card" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--gray-200)', fontWeight: '600', color: 'var(--gray-700)' }}>Reporting & Analytics Preferences</div>
                    <div className="card-body">
                        <div className="mb-3">
                            <label htmlFor="defaultReportFilters" className="form-label">Default Report Filters</label>
                            <select className="form-select" id="defaultReportFilters" value={defaultReportFilters} onChange={(e) => setDefaultReportFilters(e.target.value)}>
                                <option value="lastWeek">Last Week</option>
                                <option value="lastMonth">Last Month</option>
                                <option value="allTime">All Time</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="dataExportFormat" className="form-label">Data Export Format</label>
                            <select className="form-select" id="dataExportFormat" value={dataExportFormat} onChange={(e) => setDataExportFormat(e.target.value)}>
                                <option value="csv">CSV</option>
                                <option value="pdf">PDF</option>
                            </select>
                        </div>
                    </div>
                </section>
            )}

            {/* Theme/Appearance */}
            <section className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--gray-200)', fontWeight: '600', color: 'var(--gray-700)' }}>Theme and Appearance</div>
                <div className="card-body">
                    <div className="mb-3">
                        <label htmlFor="theme" className="form-label">Theme</label>
                        <select className="form-select" id="theme" value={theme} onChange={(e) => setTheme(e.target.value)}>
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="fontSize" className="form-label">Font Size</label>
                        <select className="form-select" id="fontSize" value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                        </select>
                    </div>
                </div>
            </section>

            <button className="btn btn-primary" onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Settings'}
            </button>
        </div>
    );
}
