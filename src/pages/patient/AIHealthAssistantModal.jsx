import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Send, Loader2, Sparkles, AlertCircle, X, RotateCcw } from 'lucide-react';
import ChatWindow from './ChatWindow';

const AIHealthAssistantModal = ({ isOpen, onClose, onReset, initialMessages, onSendMessage, isTyping, error, resetKey }) => {
    const [chatMessages, setChatMessages] = useState(initialMessages);
    const [chatInput, setChatInput] = useState('');

    useEffect(() => {
        setChatMessages(initialMessages);
    }, [initialMessages, resetKey]);

    const handleSendMessage = (customQuery = null) => {
        const query = customQuery || chatInput.trim();
        if (!query) return;
        setChatInput('');
        onSendMessage(query);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 ">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden ">

                <div className="bg-gradient-to-r from-[#00a896] to-[#02c39a] p-5 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                                    AI Health Assistant
                                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-lg">Beta</span>
                                </h2>
                                <p className="text-white/80 text-lg">
                                    • Real-time Analysis
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={onReset}
                                className="p-2 hover:bg-white/20 cursor-pointer rounded-lg transition-colors text-white border-none outline-none bg-transparent"
                                title="Reset Chat"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 cursor-pointer rounded-lg transition-colors text-white border-none outline-none bg-transparent"
                                title="Close"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                <ChatWindow
                    chatMessages={chatMessages}
                    isTyping={isTyping}
                    handleQuickAction={handleSendMessage}
                />

                <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
                    {error && (
                        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-lg text-red-700">
                            <AlertCircle className="w-4 h-4" />
                            <span>{error}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        <textarea
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask about your health records, goals, or get recommendations..."
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00a896] focus:border-[#00a896] resize-none text-lg"
                            rows="1"
                            disabled={isTyping}
                        />
                        <button
                            onClick={() => handleSendMessage()}
                            disabled={!chatInput.trim() || isTyping}
                            className="h-[46px] w-[46px] cursor-pointer flex items-center justify-center bg-gradient-to-r from-[#00a896] to-[#02c39a] text-white rounded-xl hover:from-[#028090] hover:to-[#026f80] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            {isTyping ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    <p className="text-lg text-center text-gray-500 mt-2">
                        💡 I can analyze your reports, track goals, and provide personalized health insights
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AIHealthAssistantModal;