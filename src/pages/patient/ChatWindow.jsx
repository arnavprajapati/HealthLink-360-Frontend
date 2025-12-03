import React, { useEffect, useRef } from 'react';
import { Bot, User, FileText, Target, TrendingUp, Activity, AlertCircle } from 'lucide-react';

const quickActions = [
    { icon: <FileText className="w-4 h-4" />, text: "Summarize my latest health report", query: "Can you summarize my latest health report?" },
    { icon: <Target className="w-4 h-4" />, text: "Show my goal progress", query: "How am I doing with my health goals?" },
    { icon: <TrendingUp className="w-4 h-4" />, text: "What are my abnormal values?", query: "Which of my test results are abnormal?" },
    { icon: <Activity className="w-4 h-4" />, text: "Give me health recommendations", query: "What health recommendations do you have for me?" }
];

const renderMessageText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
        const trimmedLine = line.trim();

        if (trimmedLine.includes('**')) {
            const formattedLine = trimmedLine.split(/\*\*(.*?)\*\*/g).map((part, i) =>
                i % 2 === 1 ? <span key={i} className="font-medium text-gray-800">{part}</span> : part
            );

            if (/^\d+\.\s*\*\*/.test(trimmedLine)) {
                return (
                    <div key={idx} className="mt-3 mb-2 pb-2 border-b border-gray-100">
                        <h3 className="text-base font-medium text-[#028090] flex items-center gap-1">
                            <span className="text-[#00a896]">{trimmedLine.match(/^\d+/)[0]}.</span>
                            <span>{formattedLine.slice(1)}</span>
                        </h3>
                    </div>
                );
            }

            if (trimmedLine.startsWith('*') && !trimmedLine.startsWith('**')) {
                const cleanedLine = formattedLine.map((part, i) => {
                    if (i === 0 && typeof part === 'string') {
                        return part.replace(/^\*\s*/, '');
                    }
                    return part;
                });
                return (
                    <div key={idx} className="flex items-start gap-2 ml-2 my-0.5">
                        <span className="text-[#00a896] text-xs mt-1.5">●</span>
                        <span className="text-gray-600 text-base">{cleanedLine}</span>
                    </div>
                );
            }

            return <p key={idx} className="mb-1 text-base text-gray-600">{formattedLine}</p>;
        }

        if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
            return (
                <div key={idx} className="flex items-start gap-2 ml-2 my-0.5">
                    <span className="text-[#00a896] text-xs mt-1.5">●</span>
                    <span className="text-gray-600 text-base">{trimmedLine.replace(/^[•-]\s*/, '')}</span>
                </div>
            );
        }

        if (/^\d+\./.test(trimmedLine) && !trimmedLine.includes('**')) {
            return (
                <div key={idx} className="mt-3 mb-2 pb-2 border-b border-gray-100">
                    <h3 className="text-base font-medium text-[#028090] flex items-center gap-1">
                        <span className="text-[#00a896]">{trimmedLine.match(/^\d+/)[0]}.</span>
                        <span>{trimmedLine.replace(/^\d+\.\s*/, '')}</span>
                    </h3>
                </div>
            );
        }

        if (trimmedLine.endsWith(':') && trimmedLine.length < 60 && !trimmedLine.includes('**')) {
            return (
                <p key={idx} className="font-medium text-[#028090] mt-2 mb-1 text-base">
                    {trimmedLine}
                </p>
            );
        }

        return trimmedLine ? <p key={idx} className="mb-1 text-gray-600 text-base leading-relaxed">{trimmedLine}</p> : <div key={idx} className="h-1" />;
    });
};

const renderSuggestionButton = (suggestion, handleQuickAction, isTyping) => (
    <button
        onClick={() => handleQuickAction(suggestion)}
        className="block w-full text-left px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-[#00a896] hover:bg-[#f0f3bd]/30 transition-all text-base text-gray-700"
        disabled={isTyping}
    >
        {suggestion}
    </button>
);


const ChatWindow = ({ chatMessages, isTyping, handleQuickAction }) => {
    const messagesEndRef = useRef(null);
    const showQuickActions = chatMessages.length === 1;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages, isTyping]);


    return (
        <>
            {showQuickActions && (
                <div className="p-4 bg-[#f0f3bd]/20 border-b border-gray-200 flex-shrink-0 ">
                    <p className="text-base text-gray-600 mb-3 font-medium">Quick Actions:</p>
                    <div className="grid grid-cols-2 gap-3">
                        {quickActions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleQuickAction(action.query)}
                                className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-[#00a896] hover:bg-[#f0f3bd]/30 transition-all text-left"
                                disabled={isTyping}
                            >
                                <div className="text-[#00a896]">{action.icon}</div>
                                <span className="text-gray-700 text-base">{action.text}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex-1 p-6 pt-10 bg-gray-50 overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ">
                {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-start space-x-3 ${msg.role === 'user' ? 'max-w-[70%] flex-row-reverse space-x-reverse' : 'max-w-[85%]'}`}>

                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'ai' ? 'bg-[#02c39a]' : 'bg-gray-300'
                                }`}>
                                {msg.role === 'ai' ? (
                                    <Bot className="w-5 h-5 text-white" />
                                ) : (
                                    <User className="w-5 h-5 text-gray-600" />
                                )}
                            </div>

                            <div className="flex flex-col gap-2 flex-1">
                                <div className={`rounded-2xl ${msg.role === 'ai'
                                    ? msg.isError
                                        ? 'bg-red-50 border border-red-200 text-red-800 px-5 py-3'
                                        : 'bg-white border border-gray-200 shadow-sm px-5 py-4'
                                    : 'bg-[#02c39a] text-white px-5 py-3'
                                    }`}>
                                    <div className={`${msg.role === 'ai' ? 'text-base' : 'text-base'} leading-relaxed`}>
                                        {renderMessageText(msg.text)}
                                    </div>
                                </div>

                                {msg.suggestions && msg.suggestions.length > 0 && (
                                    <div className="space-y-2 mt-2">
                                        <p className="text-base text-gray-500 ml-1 flex items-center gap-1">
                                            <span>💡</span>
                                            <span className="font-medium">You might also want to ask:</span>
                                        </p>
                                        <div className="grid gap-2">
                                            {msg.suggestions.map((suggestion, sIdx) => (
                                                <div key={sIdx}>{renderSuggestionButton(suggestion, handleQuickAction, isTyping)}</div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <span className="text-sm text-end font-semibold text-gray-400 ml-1">
                                    {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="flex items-start space-x-3 max-w-[80%]">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00a896] to-[#02c39a] flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm">
                                <div className="flex space-x-2">
                                    <div className="w-2 h-2 bg-[#00a896] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-[#00a896] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-[#00a896] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>
        </>
    );
};

export default ChatWindow;