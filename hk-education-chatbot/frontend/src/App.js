import React, { useState, useRef, useEffect } from 'react';
import { 
    GraduationCap, 
    Send, 
    RotateCcw, 
    Moon, 
    Sun, 
    User, 
    School,
    Database,
    Cpu,
    AlertCircle,
    Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BACKEND_URL = 'http://localhost:5000';

const PathFinderPro = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isRagMode, setIsRagMode] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    
    // Initial welcome message
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                content: "你好！我是 PathFinder Pro 升學顧問。我可以幫助你了解在香港升學的各種選擇和機會。你可以詢問關於：\n• 大學課程資訊\n• 入學要求\n• 申請流程\n• 獎學金機會\n請告訴我你想了解什麼？",
                sender: 'bot',
                timestamp: new Date().toLocaleTimeString()
            }]);
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || isProcessing) return;

        const newMessage = {
            content: inputMessage,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, newMessage]);
        setInputMessage('');
        setIsProcessing(true);
        setError(null);

        try {
            const response = await fetch(`${BACKEND_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: inputMessage,
                    useRag: isRagMode
                })
            });

            const data = await response.json();

            if (response.ok) {
                const botResponse = {
                    content: data.response,
                    sender: 'bot',
                    timestamp: new Date().toLocaleTimeString(),
                    mode: data.mode
                };
                setMessages(prev => [...prev, botResponse]);
            } else {
                throw new Error(data.error || '服務器錯誤');
            }
        } catch (error) {
            console.error('Error:', error);
            setError(error.message || '連接服務器時出現問題');
            const errorResponse = {
                content: `抱歉，${error.message || '連接服務器時出現問題'}。請稍後再試。`,
                sender: 'bot',
                timestamp: new Date().toLocaleTimeString(),
                isError: true
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsProcessing(false);
        }
    };

    const QuickQuestion = ({ text }) => (
        <button 
            onClick={() => setInputMessage(text)}
            disabled={isProcessing}
            className={`text-sm px-4 py-2 rounded-full transition-all duration-300 ${
                isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {text}
        </button>
    );

    const ModeIndicator = () => (
        <div className="flex items-center space-x-2">
            <span className={`flex items-center ${isRagMode ? 'text-blue-500' : 'text-gray-500'}`}>
                {isRagMode ? <Database size={14} /> : <Cpu size={14} />}
            </span>
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {isRagMode ? 'RAG Mode - 智能檢索增強' : 'Basic Mode - 基礎模式'}
            </span>
            {isProcessing && (
                <span className="animate-spin">
                    <Loader size={14} />
                </span>
            )}
        </div>
    );

    const ErrorBanner = ({ message }) => (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                isDarkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-50 text-red-600'
            }`}
        >
            <AlertCircle size={16} />
            <span className="text-sm">{message}</span>
        </motion.div>
    );

    return (
        <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`p-4 shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <GraduationCap className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                <School className={`w-4 h-4 absolute -bottom-1 -right-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                            </div>
                            <div>
                                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                    PathFinder Pro
                                </h1>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    你的香港升學指導專家
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setIsRagMode(!isRagMode)}
                                    disabled={isProcessing}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                                        isRagMode 
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                                            : 'bg-gray-200 text-gray-700'
                                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span className="font-mono">{isRagMode ? 'RAG' : 'Basic'}</span>
                                    <span className="text-xs">
                                        {isRagMode ? '(智能檢索)' : '(基礎模式)'}
                                    </span>
                                </button>
                                
                                <div className="relative group">
                                    <button className={`w-5 h-5 rounded-full flex items-center justify-center text-xs
                                        ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                                        ?
                                    </button>
                                    <div className={`absolute right-0 top-full mt-2 w-48 p-2 rounded-lg text-xs transform scale-0 group-hover:scale-100 transition-transform origin-top-right z-50 shadow-lg ${
                                        isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-700'
                                    }`}>
                                        <p>RAG模式: 使用智能檢索增強回答準確度</p>
                                        <p className="mt-1">Basic模式: 使用基礎對話模式</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className={`p-2 rounded-full transition-colors ${
                                    isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'
                                }`}
                            >
                                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Mode Status Bar */}
            <div className={`px-4 py-1 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <ModeIndicator />
                    {error && <ErrorBanner message={error} />}
                </div>
            </div>

            {/* Chat Container */}
            <div className="flex-1 overflow-hidden">
                <div className="max-w-6xl mx-auto h-full p-4">
                    <div className={`h-full rounded-2xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 overflow-y-auto`}>
                        <AnimatePresence>
                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                                >
                                    <div className={`flex items-start max-w-[70%] space-x-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                            message.sender === 'user' 
                                                ? 'bg-blue-600' 
                                                : message.isError 
                                                    ? 'bg-red-600'
                                                    : isDarkMode ? 'bg-green-700' : 'bg-green-100'
                                        }`}>
                                            {message.sender === 'user' 
                                                ? <User size={16} className="text-white" />
                                                : message.isError
                                                    ? <AlertCircle size={16} className="text-white" />
                                                    : <GraduationCap size={16} className={isDarkMode ? 'text-green-300' : 'text-green-700'} />
                                            }
                                        </div>
                                        <div className={`rounded-2xl px-4 py-3 ${
                                            message.sender === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : message.isError
                                                    ? isDarkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-50 text-red-600'
                                                    : isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-green-50 text-gray-800'
                                        }`}>
                                            <p className="text-sm whitespace-pre-line">{message.content}</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className={`text-xs ${
                                                    message.sender === 'user' 
                                                        ? 'text-blue-200' 
                                                        : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                }`}>
                                                    {message.timestamp}
                                                </p>
                                                {message.mode && (
                                                    <span className={`text-xs ${
                                                        message.mode === 'RAG' ? 'text-blue-400' : 'text-gray-400'
                                                    }`}>
                                                        {message.mode}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Quick Questions */}
            <div className={`px-4 py-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="max-w-6xl mx-auto">
                    <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                        <QuickQuestion text="香港大學有什麼熱門專業？" />
                        <QuickQuestion text="獎學金申請條件是什麼？" />
                        <QuickQuestion text="需要參加什麼考試？" />
                        <QuickQuestion text="申請截止日期是什麼時候？" />
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`p-4 shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
                <div className="max-w-6xl mx-auto">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="詢問關於香港升學的問題..."
                            disabled={isProcessing}
                            className={`flex-1 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                isDarkMode 
                                    ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600' 
                                    : 'bg-gray-100 text-gray-900 placeholder-gray-500 border-gray-200'
                            } ${isProcessing ? 'opacity-50' : ''}`}
                        />
                        <div className="flex space-x-2">
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className={`bg-blue-600 text-white rounded-xl px-6 py-3 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                    isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {isProcessing ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                            <button
                                type="button"
                                onClick={() => setMessages([])}
                                disabled={isProcessing}
                                className={`rounded-xl px-6 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${
                                    isDarkMode 
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default PathFinderPro;