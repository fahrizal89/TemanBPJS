/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { MessageSquare, HelpCircle, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ChatInterface from './components/ChatInterface';

export default function App() {
  const [activeMenu, setActiveMenu] = useState<'chat' | 'help'>('chat');
  const [showToast, setShowToast] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText('fahrizalfms@gmail.com');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-6 flex flex-col gap-6 sticky top-0 h-screen">
        <h2 className="text-xl font-bold text-gray-800">Menu</h2>
        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveMenu('chat')}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${activeMenu === 'chat' ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-gray-100'}`}
          >
            <MessageSquare size={20} />
            Tanya Jawab
          </button>
          <button 
            onClick={() => setActiveMenu('help')}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${activeMenu === 'help' ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-gray-100'}`}
          >
            <HelpCircle size={20} />
            Tentang
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <header className="bg-white border-b p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-800">Konselor BPJS</h1>
        </header>
        {activeMenu === 'chat' ? (
          <ChatInterface />
        ) : (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Tentang</h1>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-700">Developer: <span className='font-semibold'>Fahrizal Sentosa</span></p>
                <p className="text-gray-700 flex items-center gap-2">
                  Email: <span className='font-semibold'>fahrizalfms@gmail.com</span>
                  <button 
                    onClick={copyEmail}
                    className="text-gray-500 hover:text-emerald-600 transition"
                    title="Salin email"
                  >
                    <Copy size={16} />
                  </button>
                </p>
            </div>
          </div>
        )}
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            Email berhasil disalin!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

