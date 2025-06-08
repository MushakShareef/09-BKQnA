

// ✅ App.jsx (with ripple effect on speaking)
import React, { useEffect, useState } from 'react';
import './App.css';
import SearchBox from './components/SearchBox';
import AnswerDisplay from './components/AnswerDisplay';
import qaData from './qaData';
import synonymMap from './utils/synonymMap';
import VoiceRipple from './components/VoiceRipple';
import { playTamilAudio, onSpeakStatusChange } from './utils/playTamilAudio';
import { speakWithFallback, onSpeakStatusChangeFallback, stopAllSpeaking } from './utils/speakWithFallback';



function expandWithSynonyms(words) {
  const expanded = new Set();
  words.forEach(word => {
    expanded.add(word);
    const synonyms = synonymMap[word];
    if (synonyms) synonyms.forEach(s => expanded.add(s));
  });
  return Array.from(expanded);
}

function App() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // ✅ Register the callback for animation
  useEffect(() => {
    onSpeakStatusChange(setIsSpeaking);
  }, []);

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
    
    console.log("Speaking with fallback:", bestMatch.answer, audioFileName);
    speakWithFallback(`பாபா சொல்கிறார்: ${bestMatch.answer} (${bestMatch.source})`, audioFileName);
    } else {
      setResult({ message: "மன்னிக்கவும், பதில் காணவில்லை." });
    }

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
