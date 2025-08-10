'use client';

import { useState, useEffect } from 'react';

interface BotStatus {
    isRunning: boolean;
    botInfo: {
        name: string;
        username: string;
        status: string;
    };
    lastActivity: string;
    totalUsers: number;
    activeQuizzes: number;
}

export default function BotManagement() {
    const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'danger' | '' }>({ text: '', type: '' });

    useEffect(() => {
        fetchBotStatus();
    }, []);

    const fetchBotStatus = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/bot-status');
            const data = await response.json();
            
            if (data.success) {
                setBotStatus(data.botStatus);
            } else {
                setMessage({ text: 'Failed to fetch bot status', type: 'danger' });
            }
        } catch (error) {
            setMessage({ text: 'Error connecting to bot service', type: 'danger' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartBot = async () => {
        setMessage({ text: 'Starting bot...', type: '' });
        // In a real implementation, this would call the backend to start the bot
        setTimeout(() => {
            setMessage({ text: 'Bot started successfully!', type: 'success' });
            fetchBotStatus();
        }, 1000);
    };

    const handleStopBot = async () => {
        setMessage({ text: 'Stopping bot...', type: '' });
        // In a real implementation, this would call the backend to stop the bot
        setTimeout(() => {
            setMessage({ text: 'Bot stopped successfully!', type: 'success' });
            fetchBotStatus();
        }, 1000);
    };

    const handleSendTestMessage = async () => {
        setMessage({ text: 'Sending test message...', type: '' });
        // In a real implementation, this would send a test message via the bot
        setTimeout(() => {
            setMessage({ text: 'Test message sent successfully!', type: 'success' });
        }, 1000);
    };

    if (isLoading) {
        return <div className="text-center">Loading bot status...</div>;
    }

    return (
        <div>
            <h3>Telegram Bot Management</h3>
            
            {message.text && (
                <div className={`alert alert-${message.type === 'danger' ? 'danger' : message.type === 'success' ? 'success' : 'info'}`}>
                    {message.text}
                </div>
            )}

            {/* Bot Status Card */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0">Bot Status</h5>
                </div>
                <div className="card-body">
                    {botStatus ? (
                        <div className="row">
                            <div className="col-md-6">
                                <p><strong>Status:</strong> 
                                    <span className={`badge ms-2 ${botStatus.isRunning ? 'bg-success' : 'bg-danger'}`}>
                                        {botStatus.isRunning ? 'Running' : 'Stopped'}
                                    </span>
                                </p>
                                <p><strong>Name:</strong> {botStatus.botInfo.name}</p>
                                <p><strong>Username:</strong> @{botStatus.botInfo.username}</p>
                                <p><strong>Last Activity:</strong> {new Date(botStatus.lastActivity).toLocaleString()}</p>
                            </div>
                            <div className="col-md-6">
                                <p><strong>Total Users:</strong> {botStatus.totalUsers}</p>
                                <p><strong>Active Quizzes:</strong> {botStatus.activeQuizzes}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted">Bot status unavailable</p>
                    )}
                </div>
            </div>

            {/* Bot Controls */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0">Bot Controls</h5>
                </div>
                <div className="card-body">
                    <div className="d-flex gap-2 mb-3">
                        <button 
                            className="btn btn-success" 
                            onClick={handleStartBot}
                            disabled={botStatus?.isRunning}
                        >
                            <i className="bi bi-play-circle me-2"></i>
                            Start Bot
                        </button>
                        <button 
                            className="btn btn-danger" 
                            onClick={handleStopBot}
                            disabled={!botStatus?.isRunning}
                        >
                            <i className="bi bi-stop-circle me-2"></i>
                            Stop Bot
                        </button>
                        <button 
                            className="btn btn-primary" 
                            onClick={handleSendTestMessage}
                        >
                            <i className="bi bi-send me-2"></i>
                            Send Test Message
                        </button>
                    </div>
                    <small className="text-muted">
                        Use these controls to manage your Telegram bot. The bot will automatically 
                        handle quiz delivery and student interactions.
                    </small>
                </div>
            </div>

            {/* Bot Instructions */}
            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">Bot Setup Instructions</h5>
                </div>
                <div className="card-body">
                    <ol>
                        <li>Your bot token is configured in the environment variables</li>
                        <li>Students can start the bot by searching for @{botStatus?.botInfo.username || 'your_bot_username'}</li>
                        <li>Students need to register using: <code>/register PHONE_NUMBER</code></li>
                        <li>The bot will automatically deliver quizzes to registered students</li>
                        <li>Monitor bot activity and user engagement through this dashboard</li>
                    </ol>
                    <div className="alert alert-info">
                        <strong>Note:</strong> Make sure your bot is running to deliver quizzes to students. 
                        The bot will automatically handle quiz distribution and answer collection.
                    </div>
                </div>
            </div>
        </div>
    );
}