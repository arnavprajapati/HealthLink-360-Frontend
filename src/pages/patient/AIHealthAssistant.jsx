import React, { useState } from 'react';
import { Bot, User as UserIcon, Send } from 'lucide-react';

const AIHealthAssistant = () => {
    const [chatMessages, setChatMessages] = useState([
        { role: 'ai', text: 'Hello! I\'m your AI health assistant. How can I help you today?' }
    ]);
    const [chatInput, setChatInput] = useState('');

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;

        setChatMessages([...chatMessages,
        { role: 'user', text: chatInput },
        { role: 'ai', text: 'This is a demo AI response. Full AI integration coming soon!' }
        ]);
        setChatInput('');
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#00a896] to-[#02c39a] p-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                    <Bot className="w-5 h-5 mr-2" />
                    AI Health Assistant
                </h3>
                <p className="text-base text-[#f0f3bd] mt-1">Ask me anything about your health</p>
            </div>

            <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-start space-x-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'ai' ? 'bg-[#00a896]' : 'bg-gray-300'}`}>
                                {msg.role === 'ai' ? (
                                    <Bot className="w-4 h-4 text-white" />
                                ) : (
                                    <UserIcon className="w-4 h-4 text-gray-600" />
                                )}
                            </div>
                            <div className={`rounded-lg p-3 ${msg.role === 'ai' ? 'bg-white border border-gray-200' : 'bg-[#00a896] text-white'}`}>
                                <p className="text-base">{msg.text}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-3 bg-white border-t border-gray-200">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a896] focus:border-[#00a896] text-base"
                    />
                    <button
                        onClick={handleSendMessage}
                        className="p-2 bg-[#00a896] text-white rounded-lg hover:bg-[#028090] transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-base text-gray-500 mt-2 text-center">
                    🤖 Demo Mode - Full AI coming soon
                </p>
            </div>
        </div>
    );
};

export default AIHealthAssistant;