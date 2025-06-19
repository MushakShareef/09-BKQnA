

// ✅ App.jsx (with BaapDhadha welcome screen)
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

// 🔆 Expand synonyms
function expandWithSynonyms(words) {
  const expanded = new Set();
  words.forEach(word => {
    expanded.add(word);
    const synonyms = synonymMap[word];
    if (synonyms) synonyms.forEach(s => expanded.add(s));
  });
  return Array.from(expanded);
}

// 🎬 Intro Screen Component
function GnaniIntro({ onFinish }) {
  useEffect(() => {
    const greetings = [
      "ஓம் சாந்தி. மஹான் ஆத்மா.",
      "ஓம் சாந்தி. பூஜ்ய ஆத்மா.",
      "ஓம் சாந்தி. பரிஷ்தா.",
      "ஓம் சாந்தி. விக்னவிநாசக் ஆத்மா.",
      "ஓம் சாந்தி. தேவ ஆத்மா."
    ];

    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    speakTamil(randomGreeting);

    const timer = setTimeout(() => {
      onFinish(); // fade out after 5 seconds
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

// 🌟 Main App
function App() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  // ✅ Handle first time check
  useEffect(() => {
    const isFirstTime = !localStorage.getItem('gnaniIntroShown');
    if (isFirstTime) {
      setShowIntro(true);
      localStorage.setItem('gnaniIntroShown', 'yes');
    }

    onSpeakStatusChange(setIsSpeaking);
  }, []);

  // 🔎 Handle Q&A
  function handleSearch() {
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

      speakWithFallback(`பாபா சொல்கிறார்: ${bestMatch.answer} (${bestMatch.source})`, audioFileName);
    } else {
      setResult({ message: "மன்னிக்கவும், பதில் காணவில்லை." });
    }
  }

  // 🌄 Show welcome screen only once
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

        <SearchBox inputText={inputText} setInputText={setInputText} onSearch={handleSearch} />
        <AnswerDisplay result={result} />
      </div>
    </div>
  );
}

export default App;
