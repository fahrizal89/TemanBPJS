import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { chatWithBPJSStream } from '../services/geminiService';

import botAvatar from '../../assets/pp_llm.png';

export default function ChatInterface() {
  const [messages, setMessages] = useState<{ id: string; role: 'user' | 'bot'; text: string }[]>([
    { id: '1', role: 'bot', text: 'Halo! Saya asisten virtual BPJS Kesehatan. Ada yang bisa saya bantu hari ini terkait layanan BPJS?\n\n```json\n{"followUp": ["Apakah operasi caesar saya ditanggung?", "Berapa selisih biaya kalau naik ke kelas 1?", "Apakah perawatan gigi bungsu ditanggung?"]}\n```' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage = { id: Date.now().toString(), role: 'user' as const, text: text };
    setMessages(prev => [...prev, userMessage]);
    
    if (userMessage.text === input) {
        setInput('');
    }
    setIsLoading(true);

    // Create an empty bot message
    const botMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMessageId, role: 'bot', text: '' }]);

    try {
      await chatWithBPJSStream(userMessage.text, (chunk) => {
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId ? { ...msg, text: msg.text + chunk } : msg
        ));
      });
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId ? { ...msg, text: 'Maaf, terjadi kesalahan. Silakan coba lagi.' } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const renderBotMessage = (text: string) => {
    // Extract JSON part
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    let followUp: string[] = [];
    let mainContent = text;

    if (jsonMatch) {
        try {
            const jsonObj = JSON.parse(jsonMatch[1]);
            followUp = jsonObj.followUp || [];
            mainContent = text.replace(jsonMatch[0], '');
        } catch (e) {
            console.error("Failed to parse JSON follow-up", e);
        }
    }

    return (
        <div className="text-gray-800 text-sm space-y-3">
            <div className="space-y-2 [&>p]:mb-2 [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4">
                <Markdown>{mainContent}</Markdown>
            </div>
            {followUp.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                    {followUp.map((q, i) => (
                        <button
                            key={i}
                            onClick={() => handleSend(q)}
                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs px-3 py-1.5 rounded-full border border-emerald-200 transition"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map(message => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`p-1 rounded-full h-8 w-8 mt-1 flex items-center justify-center ${message.role === 'user' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-gray-600'}`}>
                    {message.role === 'bot' ? <img src={botAvatar} alt="Consultant" className="w-full h-full rounded-full object-cover" /> : <User size={18} />}
                </div>
                <div className={`p-3 rounded-2xl ${message.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                  {message.role === 'bot' ? (
                    renderBotMessage(message.text)
                  ) : (
                    message.text
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex gap-3 items-center bg-gray-200 p-3 rounded-2xl">
                <Loader2 size={18} className="animate-spin text-gray-600" />
                <span className="text-sm text-gray-600">Mengetik...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend(input)}
            placeholder="Tanyakan layanan BPJS di sini..."
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={isLoading || !input.trim()}
            className="bg-emerald-600 text-white p-3 rounded-full hover:bg-emerald-700 disabled:bg-gray-400"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
