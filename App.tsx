
import React, { useState, useCallback, FormEvent, useRef, useEffect } from 'react';
import { ComparisonResponse, ChatMessage } from './types';
import { generateComparison, sendFollowUpMessage } from './services/geminiService';
import DeviceComparisonCard from './components/DeviceComparisonCard';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const [device1, setDevice1] = useState<string>('iPhone 15 Pro');
  const [device2, setDevice2] = useState<string>('Pixel 8 Pro');
  const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for follow-up chat
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [followUpInput, setFollowUpInput] = useState<string>('');
  const [isAnswering, setIsAnswering] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAnswering]);


  const handleCompare = useCallback(async () => {
    if (!device1 || !device2) {
      setError('Please enter both device names.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setComparison(null);
    setChatHistory([]);
    setFollowUpInput('');

    try {
      const result = await generateComparison(device1, device2);
      setComparison(result);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch comparison. The model may be unavailable. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [device1, device2]);

  const handleSendFollowUp = async (e: FormEvent) => {
    e.preventDefault();
    if (!followUpInput.trim() || !comparison || isAnswering) return;

    const userMessage: ChatMessage = { role: 'user', content: followUpInput };
    const newChatHistory = [...chatHistory, userMessage];
    setChatHistory(newChatHistory);
    
    setFollowUpInput('');
    setIsAnswering(true);
    setError(null);

    try {
        const responseText = await sendFollowUpMessage(comparison, newChatHistory);
        const modelMessage: ChatMessage = { role: 'model', content: responseText };
        setChatHistory(prev => [...prev, modelMessage]);
    } catch (err) {
        setError('Sorry, I couldn\'t answer that. Please try again.');
        // remove the user's message on failure to allow them to re-send
        setChatHistory(prev => prev.slice(0, -1));
    } finally {
        setIsAnswering(false);
    }
  };
  
  const renderInitialState = () => (
     <div className="text-center p-8 bg-base-200 rounded-lg animate-fade-in">
        <div className="mx-auto mb-4 h-16 w-16 text-brand-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-text-primary">Welcome to Device Comparator AI</h2>
        <p className="text-text-secondary">Enter two device names above and click 'Compare' to see a detailed, AI-generated side-by-side analysis.</p>
     </div>
  );

  return (
    <div className="min-h-screen bg-base-100 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
            Device Comparator AI
          </h1>
          <p className="mt-4 text-lg text-text-secondary">
            Get instant, AI-powered comparisons for any two devices.
          </p>
        </header>

        <main>
          <div className="bg-base-200 p-6 rounded-xl shadow-lg mb-10">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              <input
                type="text"
                value={device1}
                onChange={(e) => setDevice1(e.target.value)}
                placeholder="e.g., iPhone 15 Pro"
                className="col-span-1 md:col-span-2 w-full p-3 bg-base-300 rounded-lg border-2 border-transparent focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
                aria-label="Device 1 Name"
              />
              <input
                type="text"
                value={device2}
                onChange={(e) => setDevice2(e.target.value)}
                placeholder="e.g., Pixel 8 Pro"
                className="col-span-1 md:col-span-2 w-full p-3 bg-base-300 rounded-lg border-2 border-transparent focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary transition"
                aria-label="Device 2 Name"
              />
              <button
                onClick={handleCompare}
                disabled={isLoading}
                className="col-span-1 w-full p-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
              >
                {isLoading ? <Spinner /> : 'Compare'}
              </button>
            </div>
          </div>

          {error && <div role="alert" className="text-center p-4 my-4 bg-red-900/50 text-red-300 rounded-lg">{error}</div>}

          <div className="mt-6">
            {isLoading && (
              <div className="text-center">
                <Spinner large={true} />
                <p className="mt-2 text-text-secondary">Generating comparison...</p>
              </div>
            )}
            {!isLoading && !comparison && !error && renderInitialState()}
            {comparison && (
              <div className="animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <DeviceComparisonCard device={comparison.device1} style={{ animationDelay: '0s' }} />
                  <DeviceComparisonCard device={comparison.device2} style={{ animationDelay: '0.2s' }} />
                </div>
                <div className="mt-10 bg-base-200 p-6 rounded-xl shadow-lg animate-slide-in" style={{ animationDelay: '0.4s' }}>
                  <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
                    AI Summary & Recommendation
                  </h2>
                  <p className="text-text-secondary whitespace-pre-wrap leading-relaxed">{comparison.summary}</p>
                </div>
                
                {/* Follow-up Chat Section */}
                <div className="mt-10 bg-base-200 p-6 rounded-xl shadow-lg animate-slide-in" style={{ animationDelay: '0.6s' }}>
                  <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
                    Ask a Follow-up
                  </h3>
                  <div className="space-y-4 mb-4 max-h-96 overflow-y-auto p-2 pr-4 bg-base-100/50 rounded-lg">
                    {chatHistory.map((message, index) => (
                      <div key={index} className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xl px-4 py-2 rounded-2xl ${message.role === 'user' ? 'bg-brand-primary text-white rounded-br-none' : 'bg-base-300 text-text-secondary rounded-bl-none'}`}>
                          <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    {isAnswering && (
                      <div className="flex items-end gap-2 justify-start">
                        <div className="max-w-xl px-4 py-3 rounded-2xl bg-base-300 text-text-secondary rounded-bl-none">
                            <div className="flex items-center space-x-2">
                                <span className="h-2 w-2 bg-text-secondary rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-text-secondary rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-text-secondary rounded-full animate-pulse"></span>
                            </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={handleSendFollowUp} className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      value={followUpInput}
                      onChange={(e) => setFollowUpInput(e.target.value)}
                      placeholder="e.g., Which is better for gaming?"
                      className="flex-grow p-3 bg-base-300 rounded-lg border-2 border-transparent focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary transition disabled:opacity-50"
                      disabled={isAnswering}
                      aria-label="Follow-up question"
                    />
                    <button
                      type="submit"
                      disabled={isAnswering || !followUpInput.trim()}
                      className="p-3 px-6 bg-gradient-to-r from-brand-secondary to-purple-600 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
                    >
                      {isAnswering ? <Spinner /> : 'Send'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
