import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { chatWithBPJS } from '../services/geminiService';
import { initialMessage } from '../services/instructions';

import botAvatar from '../../assets/pp_llm.png';

export default function ChatInterface() {
  const [messages, setMessages] = useState<{ id: string; role: 'user' | 'bot'; text: string; isTyping?: boolean }[]>([
    { id: '1', role: 'bot', text: initialMessage, isTyping: false }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const subQuestions: Record<string, string> = {
    "🏥 Rawat Inap": "Boleh tahu lebih detail? Apa keluhan atau kondisi yang mengharuskan rawat inap?",
    "🔪 Operasi / Tindakan": "Tindakan operasi apa yang direncanakan? Apakah untuk kondisi darurat atau terencana?",
    "💊 Obat": "Bisa disebutkan nama obat atau kondisi penyakit yang membutuhkan obat tersebut?",
    "💳 Iuran & Denda": "Apakah terkait cara pembayaran, cek tunggakan, atau prosedur denda?",
    "❓ Lainnya": "Boleh dijelaskan lebih lanjut apa yang ingin kamu tanyakan?",
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage = { id: Date.now().toString(), role: 'user' as const, text: text };
    
    // Check if it's a category click (initial options)
    if (subQuestions[text]) {
        setMessages(prev => [...prev, userMessage]);
        
        setActiveCategory(text);
        const botMessageId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: botMessageId, role: 'bot', text: subQuestions[text], isTyping: false }]);
        return;
    }

    setMessages(prev => [...prev, userMessage]);
    
    if (text === input) {
        setInput('');
    }
    setIsLoading(true);

    // Create an empty bot message
    const botMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMessageId, role: 'bot', text: '', isTyping: true }]);

    try {
      const context = activeCategory ? `Topik: ${activeCategory}. Pertanyaan user: ` : "";
      const finalMessage = context + text;
      
      const response = await chatWithBPJS(finalMessage);
      
      setActiveCategory(null); // Reset category after getting a response

      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId ? { ...msg, text: response, isTyping: false } : msg
      ));
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId ? { ...msg, text: 'Maaf, terjadi kesalahan. Silakan coba lagi.', isTyping: false } : msg
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

    // Auto-link URLs
    const linkify = (text: string) => {
        // Regex to match URLs that are not part of an existing markdown link [text](url)
        const urlRegex = /(?<!\]\()(https?:\/\/[^\s<]+?)(?=[.,!?;:*]*(?:\s|$))/g;
        return text.replace(urlRegex, (url) => `[${url}](${url})`);
    };

    return (
        <div className="text-gray-800 text-sm space-y-3">
            <div className="space-y-2 [&>p]:mb-2 [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4">
                <Markdown
                    components={{
                        a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline" />
                    }}
                >{linkify(mainContent)}</Markdown>
            </div>
            {followUp.length > 0 && (
                <div className="flex flex-col gap-2 pt-2">
                    {followUp.map((q, i) => (
                        <button
                            key={i}
                            onClick={() => handleSend(q)}
                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs px-3 py-2 rounded-lg border border-emerald-200 transition text-left w-full"
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
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map(message => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              style={{ transformOrigin: message.role === 'user' ? 'bottom right' : 'bottom left' }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`p-1 rounded-full h-8 w-8 mt-1 shrink-0 flex items-center justify-center ${message.role === 'user' ? 'hidden' : 'bg-stone-200 text-gray-600'}`}>
                    {message.role === 'bot' ? <img src={botAvatar} alt="Consultant" className="w-full h-full rounded-full object-cover" /> : <User size={18} />}
                </div>
                <div className={`p-3 rounded-2xl ${message.role === 'user' ? 'bg-[#007AFF] text-white' : 'bg-[#E9E9EB] text-black'}`}>
                  {message.role === 'bot' && message.isTyping ? (
                    <div className="flex items-center gap-2">
                        <Loader2 size={18} className="animate-spin text-gray-600" />
                        <span className="text-sm text-gray-600">Mengetik...</span>
                    </div>
                  ) : message.role === 'bot' ? (
                    renderBotMessage(message.text)
                  ) : (
                    message.text
                  )}
                </div>
              </div>
            </motion.div>
          ))}
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
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={isLoading || !input.trim()}
            className="bg-[#007AFF] text-white p-3 rounded-full hover:bg-blue-600 disabled:bg-gray-400"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
