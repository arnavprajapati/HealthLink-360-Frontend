import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Activity, FileText, Target, Maximize2 } from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { useGoals } from '../../context/GoalsContext';
import axios from 'axios';
import AIHealthAssistantModal from './AIHealthAssistantModal'; 

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const ChevronRight = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

const AIHealthAssistant = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resetKey, setResetKey] = useState(0);
    const initialMessageText = '👋 Hello! I\'m your AI Health Assistant. I have access to your complete health records and progress goals. Ask me anything about:\n\n• Your health reports and test results\n• Progress on your health goals\n• Health recommendations and insights\n• Trends in your vitals\n• Specific test values or parameters';
    const [chatMessages, setChatMessages] = useState([
        {
            role: 'ai',
            text: initialMessageText,
            timestamp: new Date()
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState(null);

    const { logs = [], getHealthLogs } = useHealth();
    const { goals = [], getGoals } = useGoals();

    const handleResetChat = () => {
        setChatMessages([{ role: 'ai', text: initialMessageText, timestamp: new Date() }]);
        setResetKey(prev => prev + 1);
        setError(null);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([
                    getHealthLogs({ limit: 50 }),
                    getGoals()
                ]);
            } catch (err) {
                console.error('Error fetching data for AI Assistant:', err);
            }
        };
        fetchData();
    }, [getHealthLogs, getGoals]);

    const preparePatientContext = () => {
        console.log('📊 Preparing context - Logs:', logs.length, 'Goals:', goals.length);

        const healthSummary = logs.length > 0
            ? logs.map((log, index) => {
                const date = log.testDate ? new Date(log.testDate).toLocaleDateString() : 'Unknown';
                const recordDate = log.recordDate ? new Date(log.recordDate).toLocaleDateString() : 'Unknown';

                let readingsText = '';
                if (log.readings && log.readings.length > 0) {
                    readingsText = log.readings.map(r => {
                        let rangeText = '';
                        if (r.normalRange) {
                            if (r.normalRange.text) {
                                rangeText = ` (Normal: ${r.normalRange.text})`;
                            } else if (r.normalRange.min !== undefined && r.normalRange.max !== undefined) {
                                rangeText = ` (Normal: ${r.normalRange.min}-${r.normalRange.max})`;
                            }
                        }
                        const statusText = r.status && r.status !== 'normal' ? ` [${r.status.toUpperCase()}]` : '';
                        return `    • ${r.testName}: ${r.value} ${r.unit || ''}${rangeText}${statusText}`;
                    }).join('\n');
                }

                let aiAnalysisText = '';
                if (log.aiAnalysis) {
                    const ai = log.aiAnalysis;
                    aiAnalysisText = `
  🤖 AI Analysis:
    • Risk Level: ${ai.riskLevel || 'Not assessed'}
    • Summary: ${ai.summary || 'No summary'}
    • Abnormal Tests: ${ai.abnormalTests?.join(', ') || 'None'}
    • Key Findings: ${ai.keyFindings?.join(', ') || 'None'}
    • Detected Conditions: ${ai.detectedConditions?.join(', ') || 'None'}
    • Recommendations: ${ai.recommendations?.join('; ') || 'None'}`;
                }

                return `
📋 REPORT #${index + 1}: ${log.diseaseType?.toUpperCase() || 'GENERAL'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📅 Test Date: ${date}
  📅 Record Date: ${recordDate}
  🔬 Disease Type: ${log.diseaseType || 'General'}
  ${log.detectedDisease ? `🏥 Detected Disease: ${log.detectedDisease}` : ''}
  ${log.description ? `📝 Description: ${log.description}` : ''}

  📊 TEST READINGS:
${readingsText || '    No readings available'}
${aiAnalysisText}`;
            }).join('\n\n')
            : 'No health reports available.';


        const goalsDetails = goals.length > 0
            ? goals.map(g => {
                const daysLeft = g.deadline ? Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                const milestoneCount = g.milestones?.length || 0;
                const latestValue = milestoneCount > 0 ? g.milestones[milestoneCount - 1].value : g.currentValue;

                let goalDescription = `
📊 Goal: ${g.parameter}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: ${g.status.toUpperCase()} | Progress: ${g.progress}%
Goal Type: ${g.goalType === 'range' ? 'Maintain within range' : g.goalType === 'decrease' ? 'Decrease value' : g.goalType === 'increase' ? 'Increase value' : 'Maintain value'}

📈 VALUES:
• Initial Value: ${g.initialValue !== null && g.initialValue !== undefined ? `${g.initialValue} ${g.unit}` : 'Not set'}
• Current Value: ${latestValue !== null && latestValue !== undefined ? `${latestValue} ${g.unit}` : 'No data'}`;

                if (g.goalType === 'range' || (g.minValue !== null || g.maxValue !== null)) {
                    if (g.minValue !== null && g.maxValue !== null) {
                        goalDescription += `
• Target Range: ${g.minValue} - ${g.maxValue} ${g.unit}`;
                    } else if (g.minValue !== null) {
                        goalDescription += `
• Minimum Target: ≥ ${g.minValue} ${g.unit}`;
                    } else if (g.maxValue !== null) {
                        goalDescription += `
• Maximum Target: ≤ ${g.maxValue} ${g.unit}`;
                    }
                } else if (g.targetValue !== null && g.targetValue !== undefined) {
                    goalDescription += `
• Target Value: ${g.targetValue} ${g.unit}`;
                }

                if (g.initialValue !== null && latestValue !== null && g.initialValue !== latestValue) {
                    const change = latestValue - g.initialValue;
                    const changePercent = ((change / g.initialValue) * 100).toFixed(1);
                    goalDescription += `
• Total Change: ${change > 0 ? '+' : ''}${change.toFixed(1)} ${g.unit} (${changePercent > 0 ? '+' : ''}${changePercent}%)`;
                }

                goalDescription += `

⏱️ TIMELINE:
• Tracking Frequency: ${g.trackingFrequency}
• Started: ${g.startDate ? new Date(g.startDate).toLocaleDateString() : new Date(g.createdAt).toLocaleDateString()}`;

                if (g.deadline) {
                    goalDescription += `
• Deadline: ${new Date(g.deadline).toLocaleDateString()}
• Time Left: ${daysLeft > 0 ? `${daysLeft} days remaining` : `OVERDUE by ${Math.abs(daysLeft)} days`}`;
                } else {
                    goalDescription += `
• Deadline: No deadline set (tracking at own pace)`;
                }

                goalDescription += `

📋 PROGRESS TRACKING:
• Total Entries: ${milestoneCount} measurement${milestoneCount !== 1 ? 's' : ''} recorded`;

                if (milestoneCount > 0) {
                    goalDescription += `
• Complete Measurement History:`;
                    g.milestones.forEach((m, idx) => {
                        goalDescription += `
    ${idx + 1}. ${m.value} ${g.unit} on ${new Date(m.date).toLocaleDateString()}${m.note ? ` - Note: ${m.note}` : ''}`;
                    });

                    if (milestoneCount >= 2) {
                        const first = g.milestones[0].value;
                        const last = g.milestones[milestoneCount - 1].value;
                        const trend = last - first;
                        const trendDirection = trend > 0 ? '📈 INCREASING' : trend < 0 ? '📉 DECREASING' : '➡️ STABLE';
                        goalDescription += `
• Overall Trend: ${trendDirection} (${trend > 0 ? '+' : ''}${trend.toFixed(1)} ${g.unit})`;
                    }
                }

                if (g.notes) {
                    goalDescription += `

📝 NOTES: ${g.notes}`;
                }

                return goalDescription.trim();
            }).join('\n\n')
            : 'No active goals set.';

        const contextSummary = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏥 COMPLETE PATIENT HEALTH DATABASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 OVERVIEW:
• Total Health Reports: ${logs.length}
• Active Health Goals: ${goals.length}
• Data Last Updated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ALL HEALTH REPORTS (Complete Medical History):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${healthSummary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 ALL HEALTH GOALS (Complete Goals Database):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${goalsDetails}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
END OF COMPLETE PATIENT DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT: You have access to the COMPLETE patient health database above. Use this data to answer any question about the patient's health, test results, goals, progress, trends, and provide personalized recommendations.
        `.trim();

        const chatHistory = chatMessages
            .slice(-5)
            .filter(msg => msg.role !== 'error')
            .map(msg => ({ role: msg.role, text: msg.text }));

        return { contextSummary, chatHistory };
    };

    const handleSendMessage = async (query) => {
        const userMessage = {
            role: 'user',
            text: query,
            timestamp: new Date()
        };
        setChatMessages(prev => [...prev, userMessage]);
        setIsTyping(true);
        setError(null);

        try {
            const { contextSummary, chatHistory } = preparePatientContext();

            const response = await axios.post(
                `${BASE_URL}/api/auth/ai/chat`,
                {
                    query: query,
                    contextSummary: contextSummary,
                    chatHistory: chatHistory
                },
                { withCredentials: true }
            );

            const aiResponse = response.data.data;

            const aiMessage = {
                role: 'ai',
                text: aiResponse.response,
                suggestions: aiResponse.suggestions || [],
                timestamp: new Date()
            };
            setChatMessages(prev => [...prev, aiMessage]);

        } catch (err) {
            console.error('AI Chat Error:', err);
            const errorMsg = err.response?.data?.message || 'Failed to get AI response. Check server logs for details.';
            setError(errorMsg);

            const errorMessage = {
                role: 'ai',
                text: '❌ ' + errorMsg,
                isError: true,
                timestamp: new Date()
            };
            setChatMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            <div
                onClick={() => setIsModalOpen(true)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-lg transition-all duration-300 group"
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-[#00a896] to-[#02c39a] rounded-lg group-hover:scale-110 transition-transform">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">AI Health Assistant</h3>
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Beta</span>
                        </div>
                    </div>
                    <Maximize2 className="w-5 h-5 text-gray-400 group-hover:text-[#00a896] transition-colors" />
                </div>

                <p className="text-base text-gray-600 mb-4">
                    Click to open full chat interface for personalized health insights and recommendations.
                </p>

                <div className="flex items-center gap-2 text-base text-[#028090] font-medium">
                    <Bot className="w-4 h-4" />
                    <span>Open AI Assistant</span>
                    <ChevronRight className="w-4 h-4 ml-auto" />
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span className="text-base"> Reports</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            <span className="text-base">Track Goals</span>
                        </div>
                    </div>
                </div>
            </div>

            <AIHealthAssistantModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onReset={handleResetChat}
                initialMessages={chatMessages}
                onSendMessage={handleSendMessage}
                isTyping={isTyping}
                error={error}
                resetKey={resetKey}
            />
        </>
    );
};

export default AIHealthAssistant;