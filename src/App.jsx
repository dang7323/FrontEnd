import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Plus, Send, User, Bot, Menu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function App() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: '안녕하세요! 무엇을 도와드릴까요?' }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  // 자동 스크롤 로직
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userContent = input; // 입력값 백업
    const userMsg = { id: Date.now(), role: 'user', content: userContent };

    // 1. 유저 메시지 즉시 추가 및 입력창 초기화
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // 2. AI 대기 메시지 (로딩 효과용) 추가
    const aiTempId = Date.now() + 1;
    const aiTempMsg = {
      id: aiTempId,
      role: 'assistant',
      content: '답변을 생성 중입니다...'
    };
    setMessages(prev => [...prev, aiTempMsg]);

    try {
      // 3. 실제 API 호출
      const response = await fetch('https://backend-8qjh.onrender.com/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userContent // API 명세에 따른 필드명
        }),
      });

      if (!response.ok) throw new Error('서버 응답 오류');

      const data = await response.json();

      // 4. 대기 메시지를 실제 데이터로 교체
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiTempId
            ? { ...msg, content: data.summary } // API 응답 필드인 summary 사용
            : msg
        )
      );
    } catch (error) {
      console.error('API Error:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiTempId
            ? { ...msg, content: '죄송합니다. 서버와 연결하는 중에 오류가 발생했습니다.' }
            : msg
        )
      );
    }
  };

  return (
    <div className="flex h-screen bg-[#343541] text-gray-100 font-sans">
      {/* 사이드바 */}
      <aside className="w-[260px] bg-[#202123] p-2 flex flex-col hidden md:flex">
        <button className="flex items-center gap-3 px-3 py-3 border border-white/20 rounded-md hover:bg-gray-500/10 transition-colors text-sm mb-2">
          <Plus size={16} /> New chat
        </button>
        <div className="flex-1 overflow-y-auto mt-4 space-y-2">
          <div className="px-3 py-3 flex items-center gap-3 bg-[#343541] rounded-md cursor-pointer text-sm overflow-hidden">
            <MessageSquare size={16} />
            <span className="truncate">최근 대화 기록...</span>
          </div>
        </div>
      </aside>

      {/* 메인 채팅창 */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* 모바일 헤더 */}
        <header className="md:hidden flex items-center justify-between p-3 border-b border-white/10">
          <Menu size={24} />
          <span className="text-sm">New chat</span>
          <Plus size={24} />
        </header>

        {/* 메시지 리스트 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`py-8 flex justify-center ${msg.role === 'assistant' ? 'bg-[#444654]' : 'bg-[#343541]'}`}>
              <div className="max-w-3xl w-full px-4 flex gap-4 md:gap-6">
                <div className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-[#10a37f]' : 'bg-indigo-500'}`}>
                  {msg.role === 'assistant' ? <Bot size={20} color="white" /> : <User size={20} color="white" />}
                </div>
                <div className="prose prose-invert max-w-none leading-relaxed pt-1">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 하단 입력 영역 */}
        <div className="w-full pt-2 md:pt-0 bg-gradient-to-t from-[#343541] via-[#343541] to-transparent">
          <div className="max-w-3xl mx-auto px-4 pb-6">
            <div className="relative flex items-center">
              <textarea
                rows="1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Message ChatGPT..."
                className="w-full bg-[#40414f] text-white rounded-xl py-3 pl-4 pr-12 border border-black/10 shadow-[0_0_15px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-0 resize-none"
              />
              <button
                onClick={handleSend}
                className="absolute right-2 p-1.5 rounded-md text-gray-400 hover:bg-[#202123] transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-[12px] text-gray-400 text-center mt-3">
              ChatGPT can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}