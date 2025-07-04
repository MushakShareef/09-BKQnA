// ✅ App.jsx – with BaapDhadha intro (once per session)
import React, { useEffect, useState } from 'react';
import './App.css';
import SearchBox from './components/SearchBox';
import AnswerDisplay from './components/AnswerDisplay';
import qaData from './qaData';
import synonymMap from './utils/synonymMap';
import VoiceRipple from './components/VoiceRipple';
import { playTamilAudio, onSpeakStatusChange } from './utils/playTamilAudio';
import { speakWithFallback, onSpeakStatusChangeFallback, stopAllSpeaking } from './utils/speakWithFallback';
import { speakTamil } from './utils/speakTamil';
import { startTTSRecording, stopTTSRecordingAndGetURL, getLastRecordedURL } from './utils/ttsRecorder';

// 🔍 Expand Tamil synonyms
function expandWithSynonyms(words) {
  const expanded = new Set();
  words.forEach(word => {
    expanded.add(word);
    const synonyms = synonymMap[word];
    if (synonyms) synonyms.forEach(s => expanded.add(s));
  });
  return Array.from(expanded);
}

// 🎬 Intro Component
function GnaniIntro({ onFinish }) {
  useEffect(() => {
    const greetings = [
      "ஓஓம் சாந்தி. மஹான் ஆத்மா.",
      "ஓஓம் சாந்தி. பரிஷ்தா.",
      "ஓஓம் சாந்தி. பூஜ்ய ஆத்மா.",
      "ஓஓம் சாந்தி. விக்னவிநாசக் ஆத்மா.",
      "ஓஓம் சாந்தி. தேவ ஆத்மா."
    ];

    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

    const handleFirstInteraction = () => {
      speakTamil(randomGreeting);
      window.removeEventListener('click', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);

    const timer = setTimeout(() => {
      onFinish();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundImage: "url('/images/baapdhadha.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      zIndex: 9999,
      animation: 'fadeOut 2s ease-in-out 3s forwards'
    }} />
  );
}
 async function downloadTamilMP3FromServer(text) {
   console.log("🔊 Download button clicked with text:", text); // 👈 Add this line
  if (!text) return;

  const encodedText = encodeURIComponent(text);
  try {
    const response = await fetch(`https://gnani-voice-server.onrender.com/generate-voice?text=${encodedText}`);

    if (!response.ok) {
      alert("Voice generation failed.");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gnani_voice.mp3";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    console.error("MP3 download failed:", err);
    alert("Failed to download voice. Server may be down.");
  }
}

// 🧠 Main App
function App() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [voiceDownloadUrl, setVoiceDownloadUrl] = useState(null);
  const [mode, setMode] = useState("audio"); // 🔊 or 🎥
  const [videoFileName, setVideoFileName] = useState(null); // 🎥 Video playback state



  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('introShown');
    if (!alreadyShown) {
      setShowIntro(true);
      sessionStorage.setItem('introShown', 'yes');
    }

    onSpeakStatusChange(setIsSpeaking);
  }, []);

  async function handleSearch() {
    const query = inputText.trim();
    if (!query) {
      setResult({ message: "தயவுசெய்து ஒரு கேள்வியை உள்ளிடுங்கள்." });
      return;
    }

    const queryWords = expandWithSynonyms(query.toLowerCase().split(/\s+/));
    let bestMatch = null;
    let maxCommonWords = 0;

    for (const qa of qaData) {
      const questionWords = expandWithSynonyms(qa.question.toLowerCase().split(/\s+/));
      const commonWordsCount = questionWords.filter(word => queryWords.includes(word)).length;

      if (commonWordsCount > maxCommonWords) {
        maxCommonWords = commonWordsCount;
        bestMatch = qa;
      }
    }

    if (bestMatch && maxCommonWords > 0) {
      setResult({ answer: bestMatch.answer, source: bestMatch.source });
      const cleanQuestion = bestMatch.question.trim().replace(/[?？]/g, "");
      const audioFileName = cleanQuestion.replace(/\s+/g, "_") + ".mp3";


      if (mode === "audio") {
        await startTTSRecording();
        await speakWithFallback(`பாபா சொல்கிறார்: ${bestMatch.answer} (${bestMatch.source})`, audioFileName);
        const url = await stopTTSRecordingAndGetURL();
        if (url) setVoiceDownloadUrl(url);
      } else if (mode === "video") {
        const videoFileName = cleanQuestion.replace(/\s+/g, "_");
        setVideoFileName(videoFileName); // 🎥 Show matching video
      }


    } else {
      setResult({ message: "மன்னிக்கவும், பதில் காணவில்லை" });
    }

  }
  if (showIntro) {
    return <GnaniIntro onFinish={() => setShowIntro(false)} />;
  }

  return (
    <div className="frame-wrapper">
      <img src="/images/gnani.png" alt="Gnani Frame" className="frame-background" />
      <div className="frame-content">
        <VoiceRipple isSpeaking={isSpeaking} />

        <h3> ❄️..ஞானி..❄️ </h3>

        <img src="/images/baba.png" alt="Shiva Baba" className="baba-image" />

        <p>உங்களின் ஆன்மீக சந்தேகங்களை கேளுங்கள் அல்லது தமிழில் எழுதுங்கள் :</p>

        <button onClick={stopAllSpeaking}>
          🛑 பேசுவதை நிறுத்து (Stop Speaking)
        </button>

          <div style={{ marginBottom: '10px' }}>
            <button 
                onClick={() => setMode("audio")} 
                style={{ 
                  marginRight: '10px', 
                  backgroundColor: mode === "audio" ? "#8ef" : "#eee",
                  border: 'none', padding: '8px 16px', borderRadius: '8px'
                }}
              >
                🔊 ஆடியோ (Audio Mode)
            </button>

            <button 
                onClick={() => setMode("video")} 
                style={{ 
                  backgroundColor: mode === "video" ? "#8f8" : "#eee",
                  border: 'none', padding: '8px 16px', borderRadius: '8px'
                }}
              >
                🎥 வீடியோ (Video Mode)
            </button>
        </div>


        <SearchBox inputText={inputText} setInputText={setInputText} onSearch={handleSearch} />
        <AnswerDisplay result={result} questionText={inputText} />

        {videoFileName && (
          <video
            src={`/video/${encodeURIComponent(videoFileName)}.mp4`}
            autoPlay
            controls={false}
            onEnded={() => setVideoFileName(null)}
            style={{
              width: '100%',
              maxWidth: '480px',
              borderRadius: '16px',
              boxShadow: '0 0 20px rgba(255,255,255,0.4)',
              marginTop: '10px'
            }}
          />
        )}


        <button style={{ marginTop: '10px' }} onClick={() => downloadTamilMP3FromServer(result?.answer)}>
          🎧 MP3வாக பதிவிறக்கு
        </button>
        
      </div>
    </div>
  );
}

export default App;
