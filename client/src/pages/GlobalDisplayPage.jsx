import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const TRANSLATIONS = {
  en: {
    nowServing: 'Now Serving',
    waiting: 'Waiting for next patient',
    clinicDisplay: 'Clinic Global Display',
    callVoice: (docName, num, name) => `${docName}, Token number ${num}, ${name}, please proceed.`,
    langCode: 'en-US'
  },
  hi: {
    nowServing: 'अब सेवा में',
    waiting: 'प्रतीक्षा में',
    clinicDisplay: 'क्लिनिक ग्लोबल डिस्प्ले',
    callVoice: (docName, num, name) => `${docName}, टोकन नंबर ${num}, ${name}, कृपया आगे बढ़ें।`,
    langCode: 'hi-IN'
  },
  te: {
    nowServing: 'ఇప్పుడు సేవలో',
    waiting: 'వేచి ఉంది',
    clinicDisplay: 'క్లినిక్ గ్లోబల్ డిస్‌ప్లే',
    callVoice: (docName, num, name) => `${docName}, టోకెన్ నంబర్ ${num}, ${name}, దయచేసి ముందుకు వెళ్లండి.`,
    langCode: 'te-IN'
  }
};

const LANGS = ['en', 'hi', 'te'];

export default function GlobalDisplayPage() {
  const [queues, setQueues] = useState([]);
  const [clock, setClock] = useState('');
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('en');
  
  // Track spoken tokens to avoid repeating: { [queueId]: `${tokenId}-${lang}` }
  const spokenTokensRef = useRef({});

  const fetchData = async () => {
    try {
      const { data } = await api.get('/queues');
      setQueues(data.queues || []);
    } catch (error) {
      console.error('Failed to fetch queues', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch + polling every 10s
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Live clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      setClock(`${hours}:${minutes} ${ampm}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-cycle language every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLang(prev => {
        const nextIdx = (LANGS.indexOf(prev) + 1) % LANGS.length;
        return LANGS[nextIdx];
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Text-to-Speech Voice Announcements across all queues
  useEffect(() => {
    if (queues.length === 0) return;

    queues.forEach(queue => {
      if (queue.inServiceToken) {
        const token = queue.inServiceToken;
        // Signature based only on token ID so it only speaks once per patient
        const signature = `${token._id}`;
        
        if (spokenTokensRef.current[queue._id] !== signature) {
          // Stop any currently playing audio
          window.speechSynthesis.cancel();
          
          const speakInLang = (l) => {
            const msg = new SpeechSynthesisUtterance();
            msg.text = TRANSLATIONS[l].callVoice(queue.name, token.tokenNumber || '', token.personName || '');
            msg.lang = TRANSLATIONS[l].langCode;
            msg.rate = 0.9;
            window.speechSynthesis.speak(msg);
          };

          // Queue all three languages to play sequentially
          speakInLang('en');
          speakInLang('hi');
          speakInLang('te');
          
          spokenTokensRef.current[queue._id] = signature;
        }
      }
    });
  }, [queues]); // Removed 'lang' from dependencies so it doesn't repeat every 15 seconds

  if (loading) {
    return (
      <div className="w-screen h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col text-on-surface relative overflow-hidden bg-background" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Main Container */}
      <div className="flex flex-col h-screen w-full max-w-[1920px] mx-auto p-4 md:p-8 relative z-10">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-6 shrink-0">
          <div className="flex items-center gap-4">
            <Link to="/home" className="text-white/50 hover:text-white transition-colors flex items-center">
              <span className="material-symbols-outlined text-4xl">arrow_back</span>
            </Link>
            <span
              className="material-symbols-outlined text-white"
              style={{ fontSize: '3rem', fontVariationSettings: "'FILL' 1" }}
            >
              dashboard
            </span>
            <h1 className="text-5xl font-bold text-white tracking-tight">
              {TRANSLATIONS[lang].clinicDisplay}
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="glass-panel p-2 rounded-xl flex items-center bg-surface-container">
              <button 
                onClick={() => setLang('en')}
                className={`px-4 py-2 text-lg font-bold rounded-lg transition-colors cursor-pointer ${lang === 'en' ? 'bg-white text-black' : 'text-on-surface-variant hover:text-white'}`}
              >EN</button>
              <button 
                onClick={() => setLang('hi')}
                className={`px-4 py-2 text-lg font-bold rounded-lg transition-colors cursor-pointer ${lang === 'hi' ? 'bg-white text-black' : 'text-on-surface-variant hover:text-white'}`}
              >HI</button>
              <button 
                onClick={() => setLang('te')}
                className={`px-4 py-2 text-lg font-bold rounded-lg transition-colors cursor-pointer ${lang === 'te' ? 'bg-white text-black' : 'text-on-surface-variant hover:text-white'}`}
              >TE</button>
            </div>
            <div className="text-6xl font-black text-white tracking-tighter">
              {clock}
            </div>
          </div>
        </header>

        {/* Dynamic Grid of Doctors */}
        <main className="flex-1 min-h-0 relative">
          <div className={`w-full h-full grid gap-6 ${queues.length <= 4 ? 'grid-cols-2 grid-rows-2' : 'grid-cols-3 grid-rows-2'}`}>
            {queues.map((queue) => (
              <div key={queue._id} className="glass-panel rounded-[32px] border border-white/20 p-8 flex flex-col relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-2 bg-white/20" />
                
                <h2 className="text-2xl xl:text-3xl font-bold text-white mb-2 tracking-tight truncate border-b border-white/10 pb-4 shrink-0">
                  {queue.name}
                </h2>
                
                <div className="flex-1 flex flex-col items-center justify-center text-center mt-2 min-h-0">
                  <h3 className="text-lg xl:text-xl font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-2 xl:mb-4 shrink-0">
                    {TRANSLATIONS[lang].nowServing}
                  </h3>
                  
                  {queue.inServiceToken ? (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-0 w-full overflow-hidden">
                      <div className="text-6xl md:text-7xl xl:text-[90px] font-black text-white leading-none tracking-tighter mb-2 drop-shadow-lg shrink-0">
                        #{queue.inServiceToken.tokenNumber}
                      </div>
                      <div className="text-2xl md:text-3xl xl:text-[40px] font-bold text-white tracking-tight truncate w-full px-4 shrink-0">
                        {queue.inServiceToken.personName}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-0">
                      <div className="text-6xl md:text-7xl xl:text-[90px] font-black text-white/10 leading-none tracking-tighter mb-4 shrink-0">—</div>
                      <div className="text-lg md:text-xl xl:text-2xl font-medium text-white/40 shrink-0">{TRANSLATIONS[lang].waiting}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {queues.length === 0 && (
              <div className="col-span-full h-full flex flex-col items-center justify-center text-on-surface-variant/50">
                <span className="material-symbols-outlined text-[80px] mb-4">clinical_notes</span>
                <h2 className="text-3xl font-medium">No doctors available.</h2>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
