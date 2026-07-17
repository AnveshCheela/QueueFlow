import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import { QRCodeCanvas } from 'qrcode.react';

const TRANSLATIONS = {
  en: {
    proceed: 'Please proceed when called',
    nowServing: 'Now Serving',
    waiting: 'Waiting for next patient',
    upNext: 'Up Next',
    noPatients: 'No patients waiting',
    info: 'Please have your ID and appointment details ready.',
    callVoice: (num, name) => `Token number ${num}, ${name}, please proceed to the counter.`,
    langCode: 'en-US'
  },
  hi: {
    proceed: 'बुलाए जाने पर कृपया आगे बढ़ें',
    nowServing: 'अब सेवा में',
    waiting: 'अगले मरीज की प्रतीक्षा में',
    upNext: 'अगले',
    noPatients: 'कोई मरीज प्रतीक्षा में नहीं है',
    info: 'कृपया अपनी आईडी और अपॉइंटमेंट विवरण तैयार रखें।',
    callVoice: (num, name) => `टोकन नंबर ${num}, ${name}, कृपया काउंटर पर आएं।`,
    langCode: 'hi-IN'
  },
  te: {
    proceed: 'పిలిచినప్పుడు దయచేసి ముందుకు వెళ్లండి',
    nowServing: 'ఇప్పుడు సేవ పొందుతున్నారు',
    waiting: 'తదుపరి రోగి కోసం వేచి ఉంది',
    upNext: 'తదుపరి',
    noPatients: 'రోగులు ఎవరూ వేచి లేరు',
    info: 'దయచేసి మీ ID మరియు అపాయింట్‌మెంట్ వివరాలను సిద్ధంగా ఉంచుకోండి.',
    callVoice: (num, name) => `టోకెన్ నంబర్ ${num}, ${name}, దయచేసి కౌంటర్ వద్దకు రండి.`,
    langCode: 'te-IN'
  }
};

export default function PublicDisplayPage() {
  const { queueId } = useParams();
  const [queue, setQueue] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [clock, setClock] = useState('');
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('en');
  const [lastSpoken, setLastSpoken] = useState(null);
  
  const LANGS = ['en', 'hi', 'te'];

  // Fetch queue data
  const fetchData = async () => {
    try {
      const { data } = await api.get(`/public/queues/${queueId}`);
      const q = data.queue || data;
      setQueue(q);
      setTokens(data.tokens || q.tokens || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch + polling every 10s
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [queueId]);

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

  // Text-to-Speech Voice Announcements
  useEffect(() => {
    if (!tokens) return;

    const inServiceToken = tokens.find((t) => t.status === 'in-service');

    // We only announce when there's an in-service token
    if (inServiceToken) {
      // Signature based only on token ID so it only speaks once per patient
      const signature = `${inServiceToken._id}`;
      
      if (spokenTokenRef.current !== signature) {
        // Stop any currently playing audio
        window.speechSynthesis.cancel(); 
        
        const speakInLang = (l) => {
          const msg = new SpeechSynthesisUtterance();
          msg.text = TRANSLATIONS[l].callVoice(inServiceToken.tokenNumber || '', inServiceToken.personName || '');
          msg.lang = TRANSLATIONS[l].langCode;
          msg.rate = 0.9;
          window.speechSynthesis.speak(msg);
        };

        // Queue all three languages to play sequentially
        speakInLang('en');
        speakInLang('hi');
        speakInLang('te');
        
        spokenTokenRef.current = signature;
      }
    }
  }, [tokens]);

  const inServiceToken = tokens.find((t) => t.status === 'in-service');
  const waitingTokens = tokens.filter((t) => t.status === 'waiting');
  const upNext = waitingTokens.slice(0, 5);

  if (loading) {
    return (
      <div className="w-screen h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col text-on-surface relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* CSS-only animated background */}
      <div className="absolute inset-0 bg-background -z-10" />

      {/* Main Container */}
      <div className="flex flex-col h-screen w-full max-w-[1920px] mx-auto p-4 md:p-8 relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-white"
              style={{ fontSize: '2.5rem', fontVariationSettings: "'FILL' 1" }}
            >
              medical_services
            </span>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              {queue?.name || 'Queue'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '1.75rem' }}>campaign</span>
              <span className="text-xl font-semibold text-on-surface">{TRANSLATIONS[lang].proceed}</span>
            </div>
            
            <div className="glass-panel p-1 rounded-lg flex items-center bg-surface-container">
              <button 
                onClick={() => setLang('en')}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors cursor-pointer ${lang === 'en' ? 'bg-white text-black' : 'text-on-surface-variant hover:text-white'}`}
              >EN</button>
              <button 
                onClick={() => setLang('hi')}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors cursor-pointer ${lang === 'hi' ? 'bg-white text-black' : 'text-on-surface-variant hover:text-white'}`}
              >HI</button>
              <button 
                onClick={() => setLang('te')}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors cursor-pointer ${lang === 'te' ? 'bg-white text-black' : 'text-on-surface-variant hover:text-white'}`}
              >TE</button>
            </div>
          </div>
        </header>

        {/* Center: Now Serving */}
        <main className="flex-1 flex items-center justify-center min-h-0 mb-4 relative">
          <div className="glow-ring rounded-[30px] glass-panel w-full max-w-4xl flex flex-col items-center justify-center text-center relative overflow-hidden py-4 px-6 md:py-8">
            {/* Top gradient bar */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-30" />

            <h2 className="text-xl md:text-2xl font-semibold text-on-surface-variant uppercase tracking-[0.2em] mb-2">
              {TRANSLATIONS[lang].nowServing}
            </h2>

            {inServiceToken ? (
              <>
                <div className="text-[72px] md:text-[90px] font-black text-white leading-none tracking-tighter mb-2">
                  #{inServiceToken.tokenNumber || '?'}
                </div>
                <div className="text-[32px] md:text-[40px] font-bold text-white tracking-tight text-center px-4 leading-tight mb-4 md:mb-6">
                  {inServiceToken.personName || ''}
                </div>
                <div className="bg-white text-black px-6 py-2 rounded-full text-base md:text-lg font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>arrow_forward</span>
                  {TRANSLATIONS[lang].proceed}
                </div>
              </>
            ) : (
              <>
                <div className="text-[72px] md:text-[90px] font-black text-on-surface-variant/30 leading-none tracking-tighter mb-4">
                  —
                </div>
                <div className="text-lg md:text-xl text-on-surface-variant/60">
                  {TRANSLATIONS[lang].waiting}
                </div>
              </>
            )}
          </div>
        </main>

        {/* Bottom: Up Next & Footer */}
        <footer className="shrink-0 flex flex-col gap-4">
          {/* Up Next Grid */}
          <div className="glass-panel rounded-2xl p-4 border-t border-white/10 shadow-2xl">
            <h3 className="text-lg font-semibold text-on-surface-variant mb-3 uppercase tracking-wider border-b border-outline-variant/30 pb-2">
              {TRANSLATIONS[lang].upNext}
            </h3>
            <div className="grid grid-cols-5 gap-4">
              {upNext.length === 0 ? (
                <div className="col-span-5 text-center text-on-surface-variant/60 text-lg py-2">
                  {TRANSLATIONS[lang].noPatients}
                </div>
              ) : (
                upNext.map((token, idx) => (
                  <div
                    key={token._id}
                    className={`bg-surface-container-high rounded-xl p-4 border-l-4 ${
                      idx === 0 ? 'border-l-white' : 'border-l-outline'
                    } shadow-sm flex flex-col justify-center transition-all hover:bg-surface-variant ${
                      idx === upNext.length - 1 ? 'opacity-80' : ''
                    }`}
                  >
                    <span className="text-3xl font-bold text-white mb-1">
                      #{token.tokenNumber || '?'}
                    </span>
                    <span className="text-xl text-on-surface-variant font-medium truncate">
                      {token.personName || ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Utilities */}
          <div className="flex justify-between items-end mt-1">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-lg">
                <QRCodeCanvas 
                  value={`${window.location.origin}/status/${queueId}`}
                  size={64}
                  level="M"
                />
              </div>
              <div className="flex flex-col text-on-surface-variant">
                <span className="text-white font-bold mb-1 tracking-wider text-sm">SCAN FOR LIVE STATUS</span>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>info</span>
                  <span className="text-sm">{TRANSLATIONS[lang].info}</span>
                </div>
              </div>
            </div>
            <div className="text-4xl font-bold text-white tracking-tighter">
              {clock}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
