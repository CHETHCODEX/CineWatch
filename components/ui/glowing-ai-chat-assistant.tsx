"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Paperclip, 
  Link as LinkIcon, 
  Code, 
  Mic, 
  Send, 
  Info, 
  Bot, 
  X, 
  Loader2, 
  Bookmark, 
  Sparkles,
  Check,
  Plus
} from 'lucide-react';
import type { Movie } from '@/types/movie';
import { getPosterUrl } from '@/types/movie';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  movies?: Movie[];
}

const FloatingAiAssistant = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [watchlistIds, setWatchlistIds] = useState<number[]>([]);
  const maxChars = 2000;
  
  const chatRef = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Sync watchlist status from localStorage
  useEffect(() => {
    const syncWatchlist = () => {
      try {
        const saved = localStorage.getItem('cinewatch-watchlist');
        if (saved) {
          const parsed = JSON.parse(saved) as Movie[];
          setWatchlistIds(parsed.map(m => m.id));
        }
      } catch (err) {
        console.error('Error loading watchlist in AI chat:', err);
      }
    };
    
    syncWatchlist();
    window.addEventListener('cinewatch-watchlist-change', syncWatchlist);
    window.addEventListener('storage', syncWatchlist);
    return () => {
      window.removeEventListener('cinewatch-watchlist-change', syncWatchlist);
      window.removeEventListener('storage', syncWatchlist);
    };
  }, []);

  // Handle auto-scroll to bottom of conversation
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    setCharCount(value.length);
  };

  const handleSend = async (customMessage?: string) => {
    const textToSend = (customMessage || message).trim();
    if (!textToSend) return;

    // Add user message
    const userMsg: Message = {
      id: Math.random().toString(36).slice(2, 9),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    
    // Clear state if regular compose input
    if (!customMessage) {
      setMessage('');
      setCharCount(0);
    }

    setIsLoading(true);

    try {
      // Direct call to our custom api route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: textToSend,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        throw new Error('API server returned error status');
      }

      const data = await response.json();
      
      const assistantMsg: Message = {
        id: Math.random().toString(36).slice(2, 9),
        role: 'assistant',
        content: data.reply || 'I processed that, but could not retrieve specific details.',
        timestamp: new Date(),
        movies: data.movies || []
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMsg: Message = {
        id: Math.random().toString(36).slice(2, 9),
        role: 'assistant',
        content: "Oops! I hit a static bump in the projection booth. Please double-check your connection or add TMDB/Gemini API keys, but here's a cinematic recommendation: You should explore the high-fidelity Sci-Fi masterpiece 'Inception' or the acclaimed Neo-Noir thriller 'The Dark Knight'!",
        timestamp: new Date(),
        movies: [
          {
            id: 27205,
            title: "Inception",
            overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life.",
            poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
            backdrop_path: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
            release_date: "2010-07-15",
            vote_average: 8.4,
            genre_ids: [28, 878, 12]
          }
        ]
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Click quick-fill actions to make widget highly interactive
  const triggerQuickAction = (actionType: 'file' | 'link' | 'code' | 'design' | 'voice') => {
    let actionText = '';
    if (actionType === 'file') {
      actionText = "Recommend movies based on my recently watched library list!";
    } else if (actionType === 'link') {
      actionText = "Analyze this movie recommendation link: https://www.themoviedb.org/movie/27205-inception";
    } else if (actionType === 'code') {
      actionText = "What algorithms are best suited for building premium personalized recommendation engines?";
    } else if (actionType === 'design') {
      actionText = "Suggest a watchlist theme: 'Aesthetic Cyberpunk Classics'";
    } else if (actionType === 'voice') {
      actionText = "Recommend cozy romantic comedies for tonight!";
    }
    
    handleSend(actionText);
  };

  // Toggle watchlist status live
  const toggleWatchlist = (movie: Movie) => {
    try {
      const saved = localStorage.getItem('cinewatch-watchlist');
      let list: Movie[] = saved ? JSON.parse(saved) : [];
      
      const isExist = list.some(m => m.id === movie.id);
      if (isExist) {
        list = list.filter(m => m.id !== movie.id);
      } else {
        list.push(movie);
      }
      
      localStorage.setItem('cinewatch-watchlist', JSON.stringify(list));
      setWatchlistIds(list.map(m => m.id));
      window.dispatchEvent(new Event('cinewatch-watchlist-change'));
    } catch (err) {
      console.error('Failed to toggle watchlist in AI Assistant', err);
    }
  };

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('.floating-ai-button')) {
          setIsChatOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating 3D Glowing AI Logo */}
      <button 
        className={`floating-ai-button relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 transform cursor-pointer ${
          isChatOpen ? 'rotate-90 scale-95' : 'rotate-0 scale-100'
        }`}
        onClick={() => setIsChatOpen(!isChatOpen)}
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.85) 0%, rgba(168,85,247,0.85) 100%)',
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.7), 0 0 40px rgba(124, 58, 237, 0.5), 0 0 60px rgba(109, 40, 217, 0.3)',
          border: '2px solid rgba(255, 255, 255, 0.25)',
        }}
      >
        {/* 3D effect overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-40"></div>
        <div className="absolute inset-0 rounded-full border-2 border-white/15"></div>
        
        {/* Toggle Icon */}
        <div className="relative z-10">
          {isChatOpen ? (
            <X className="w-7 h-7 text-white" />
          ) : (
            <Bot className="w-8 h-8 text-white animate-pulse" />
          )}
        </div>
        
        {/* Radiant Ping Ring Animation */}
        <div className="absolute inset-0 rounded-full animate-ping opacity-25 bg-indigo-500"></div>
      </button>

      {/* Chat Interface */}
      {isChatOpen && (
        <div 
          ref={chatRef}
          className="absolute bottom-20 right-0 w-[450px] max-w-[calc(100vw-2rem)] transition-all duration-300 origin-bottom-right animate-popIn"
        >
          <div className="relative flex flex-col h-[580px] max-h-[80vh] rounded-3xl bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 border border-zinc-800/80 shadow-2xl backdrop-blur-2xl overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-zinc-800/40 bg-zinc-900/20">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                    CineWatch AI Assistant
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">Gemini + Cohere Enabled</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold bg-zinc-800/80 text-purple-300 border border-zinc-700/60 rounded-full">
                  Gemini
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
                  Pro
                </span>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-800/70 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation Messages View */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              {messages.length === 0 ? (
                // Greeting state
                <div className="h-full flex flex-col justify-center items-center text-center space-y-4 px-4 py-8">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <Bot className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-200">Your AI Cinematic Concierge</h3>
                  <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                    Ask me for hyper-targeted recommendations, explain movie plots, search genres, or compile dynamic CineMarathon itineraries. Equipped with Cohere Search intelligence!
                  </p>
                  
                  {/* Preset Quick Starters */}
                  <div className="grid grid-cols-2 gap-2 w-full pt-4">
                    <button 
                      onClick={() => handleSend("Give me dynamic mind-bending Sci-Fi recommendations")}
                      className="px-3 py-2 text-left text-[11px] font-medium bg-zinc-800/30 hover:bg-zinc-800/70 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-2xl transition-all"
                    >
                      🌌 Mind-bending Sci-Fi
                    </button>
                    <button 
                      onClick={() => handleSend("Suggest a perfect funny movie cozy comedy")}
                      className="px-3 py-2 text-left text-[11px] font-medium bg-zinc-800/30 hover:bg-zinc-800/70 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-2xl transition-all"
                    >
                      🍿 Cozy Comedy
                    </button>
                    <button 
                      onClick={() => handleSend("What are the best thrillers with insane plot twists?")}
                      className="px-3 py-2 text-left text-[11px] font-medium bg-zinc-800/30 hover:bg-zinc-800/70 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-2xl transition-all"
                    >
                      🎭 Thrillers with Twist
                    </button>
                    <button 
                      onClick={() => handleSend("Suggest acclaimed indie dramas under 2 hours")}
                      className="px-3 py-2 text-left text-[11px] font-medium bg-zinc-800/30 hover:bg-zinc-800/70 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-2xl transition-all"
                    >
                      🎬 Under 2hr Acclaimed
                    </button>
                  </div>
                </div>
              ) : (
                // Active messages stream
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                        {msg.role === 'assistant' ? (
                          <>
                            <Bot className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="font-semibold text-zinc-300">CineWatch AI Bot</span>
                          </>
                        ) : (
                          <span className="font-semibold text-zinc-400">You</span>
                        )}
                        <span>•</span>
                        <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      
                      <div 
                        className={`px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[85%] ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white rounded-tr-none shadow-md border border-indigo-500/20'
                            : 'bg-zinc-800/60 text-zinc-200 border border-zinc-700/40 rounded-tl-none backdrop-blur-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>

                      {/* Render recommended movies as interactive glass cards */}
                      {msg.role === 'assistant' && msg.movies && msg.movies.length > 0 && (
                        <div className="grid grid-cols-1 gap-2 w-full max-w-[90%] pt-1">
                          {msg.movies.map((movie) => {
                            const isSaved = watchlistIds.includes(movie.id);
                            return (
                              <div 
                                key={movie.id}
                                className="flex gap-3 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/90 hover:border-zinc-700/60 transition-all duration-300 shadow-lg"
                              >
                                <img 
                                  src={getPosterUrl(movie.poster_path, 'w154')}
                                  alt={movie.title}
                                  className="w-12 h-18 object-cover rounded-lg bg-zinc-800 shadow"
                                />
                                <div className="flex-1 flex flex-col min-w-0">
                                  <div className="flex justify-between items-start gap-1">
                                    <h4 className="text-xs font-bold text-zinc-100 truncate">{movie.title}</h4>
                                    <span className="text-[10px] text-zinc-400 font-bold bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700/60">
                                      ⭐ {Math.round(movie.vote_average * 10) / 10}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5 leading-normal">
                                    {movie.overview}
                                  </p>
                                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-zinc-800/60">
                                    <span className="text-[9px] text-zinc-500">{movie.release_date.slice(0, 4)}</span>
                                    <button
                                      onClick={() => toggleWatchlist(movie)}
                                      className={`flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded transition-all cursor-pointer ${
                                        isSaved 
                                          ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20'
                                          : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20'
                                      }`}
                                    >
                                      {isSaved ? (
                                        <>
                                          <Check className="w-2.5 h-2.5" />
                                          Saved
                                        </>
                                      ) : (
                                        <>
                                          <Plus className="w-2.5 h-2.5" />
                                          Add Watchlist
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Loading indicator bubble */}
                  {isLoading && (
                    <div className="flex flex-col items-start space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                        <Bot className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-semibold text-zinc-300">CineWatch AI Bot is thinking...</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-none bg-zinc-800/40 border border-zinc-800 text-zinc-400 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                        <span>Curating custom movie match...</span>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messageEndRef} />
                </div>
              )}
            </div>

            {/* Input Composer Section */}
            <div className="relative border-t border-zinc-800/50 bg-zinc-900/10">
              <textarea
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={2}
                className="w-full px-6 py-4 bg-transparent border-none outline-none resize-none text-sm font-normal leading-relaxed min-h-[70px] max-h-[140px] text-zinc-100 placeholder-zinc-500 scrollbar-none"
                placeholder="Ask CineWatch AI for suggestions, explore genres..."
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              />
              <div 
                className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-zinc-950/20 to-transparent pointer-events-none"
              ></div>
            </div>

            {/* Controls Bar Section */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Attachment Group */}
                  <div className="flex items-center gap-1.5 p-1 bg-zinc-900/60 rounded-xl border border-zinc-800/60 backdrop-blur-md">
                    {/* File Upload */}
                    <button 
                      onClick={() => triggerQuickAction('file')}
                      className="group relative p-2.5 bg-transparent border-none rounded-lg cursor-pointer transition-all duration-300 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 hover:scale-105 hover:-rotate-3 transform"
                    >
                      <Paperclip className="w-4 h-4 transition-all duration-300 group-hover:scale-125 group-hover:-rotate-12" />
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-zinc-950 text-zinc-200 text-xs rounded-lg whitespace-nowrap opacity-0 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:-translate-y-1 shadow-lg border border-zinc-800 backdrop-blur-sm">
                        Use library data
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-950"></div>
                      </div>
                    </button>

                    {/* Link */}
                    <button 
                      onClick={() => triggerQuickAction('link')}
                      className="group relative p-2.5 bg-transparent border-none rounded-lg cursor-pointer transition-all duration-300 text-zinc-500 hover:text-red-400 hover:bg-zinc-800/50 hover:scale-105 hover:rotate-6 transform"
                    >
                      <LinkIcon className="w-4 h-4 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" />
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-zinc-950 text-zinc-200 text-xs rounded-lg whitespace-nowrap opacity-0 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:-translate-y-1 shadow-lg border border-zinc-800 backdrop-blur-sm">
                        Analyze web link
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-950"></div>
                      </div>
                    </button>

                    {/* Code */}
                    <button 
                      onClick={() => triggerQuickAction('code')}
                      className="group relative p-2.5 bg-transparent border-none rounded-lg cursor-pointer transition-all duration-300 text-zinc-500 hover:text-green-400 hover:bg-zinc-800/50 hover:scale-105 hover:rotate-3 transform"
                    >
                      <Code className="w-4 h-4 transition-all duration-300 group-hover:scale-125 group-hover:-rotate-6" />
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-zinc-950 text-zinc-200 text-xs rounded-lg whitespace-nowrap opacity-0 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:-translate-y-1 shadow-lg border border-zinc-800 backdrop-blur-sm">
                        Tech suggestions
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-950"></div>
                      </div>
                    </button>

                    {/* Design (Figma icon) */}
                    <button 
                      onClick={() => triggerQuickAction('design')}
                      className="group relative p-2.5 bg-transparent border-none rounded-lg cursor-pointer transition-all duration-300 text-zinc-500 hover:text-purple-400 hover:bg-zinc-800/50 hover:scale-105 hover:-rotate-6 transform"
                    >
                      <svg className="w-4 h-4 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.354-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.015-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117v-6.038H8.148zm7.704 0c-2.476 0-4.49 2.015-4.49 4.49s2.014 4.49 4.49 4.49 4.49-2.015 4.49-4.49-2.014-4.49-4.49-4.49zm0 7.509c-1.665 0-3.019-1.355-3.019-3.019s1.355-3.019 3.019-3.019 3.019 1.354 3.019 3.019-1.354 3.019-3.019 3.019zM8.148 24c-2.476 0-4.49-2.015-4.49-4.49s2.014-4.49 4.49-4.49h4.588V24H8.148zm3.117-1.471V16.49H8.148c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.02 3.019 3.02h3.117z"></path>
                      </svg>
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-zinc-950 text-zinc-200 text-xs rounded-lg whitespace-nowrap opacity-0 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:-translate-y-1 shadow-lg border border-zinc-800 backdrop-blur-sm">
                        Curate design list
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-950"></div>
                      </div>
                    </button>
                  </div>

                  {/* Voice Button */}
                  <button 
                    onClick={() => triggerQuickAction('voice')}
                    className="group relative p-2.5 bg-transparent border border-zinc-800/80 rounded-xl cursor-pointer transition-all duration-300 text-zinc-500 hover:text-red-400 hover:bg-zinc-800/50 hover:scale-110 hover:rotate-2 transform hover:border-red-500/20"
                  >
                    <Mic className="w-4 h-4 transition-all duration-300 group-hover:scale-125 group-hover:-rotate-3" />
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-zinc-950 text-zinc-200 text-xs rounded-lg whitespace-nowrap opacity-0 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:-translate-y-1 shadow-lg border border-zinc-800 backdrop-blur-sm">
                      Voice input (mic)
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-950"></div>
                    </div>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {/* Character Counter */}
                  <div className="text-xs font-semibold text-zinc-500">
                    <span>{charCount}</span>/<span className="text-zinc-400">{maxChars}</span>
                  </div>

                  {/* Send Button */}
                  <button 
                    onClick={() => handleSend()}
                    disabled={!message.trim() || isLoading}
                    className="group relative p-3 bg-gradient-to-r from-indigo-600 to-purple-600 border-none rounded-xl cursor-pointer transition-all duration-300 text-white shadow-lg hover:scale-110 hover:shadow-indigo-500/30 hover:shadow-xl active:scale-95 disabled:opacity-40 disabled:pointer-events-none transform hover:-rotate-2"
                  >
                    <Send className="w-5 h-5 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:rotate-12 group-hover:scale-110" />
                    
                    {/* Animated background glow */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-lg transform scale-110"></div>
                    
                    {/* Ripple effect on click */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                      <div className="absolute inset-0 bg-white/20 transform scale-0 group-active:scale-100 transition-transform duration-200 rounded-xl"></div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Footer Info */}
              <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-zinc-800/40 text-[10px] text-zinc-500 gap-6">
                <div className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-zinc-500" />
                  <span>
                    Press <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700/60 rounded text-zinc-400 font-mono text-[9px] shadow-sm">Shift + Enter</kbd> for new line
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span>All networks online</span>
                </div>
              </div>
            </div>

            {/* Glowing Accent Overlay */}
            <div 
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{ 
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.03), transparent 60%, rgba(168, 85, 247, 0.03))' 
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export { FloatingAiAssistant };
