



// ✅ App.jsx (smart matching with synonyms)
import React, { useState } from 'react';
import './App.css';
import SearchBox from './components/SearchBox';
import AnswerDisplay from './components/AnswerDisplay';
import qaData from './qaData';
import synonymMap from './utils/synonymMap';
import { speakTamil, stopTamilSpeech } from './utils/speakTamil';


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
      speakTamil(`பாபா சொல்கிறார்:  ${bestMatch.answer} (${bestMatch.source})`);
    } else {
      setResult({ message: "மன்னிக்கவும், பதில் காணவில்லை." });
    }
  }

  return (
    <div className="app-container">
      <h3>☀️ ஞான ரோபோட்</h3>
      <img src="/images/baba.png" alt="Shiva Baba" width={150} height={157} style={{ borderRadius: '10px', marginTop: '10px' }} />
      <p>உங்களின் ஆன்மீக சந்தேகங்களை கேளுங்கள் அல்லது தமிழில் எழுதுங்கள் :</p>
      <button onClick={stopTamilSpeech} style={{
            marginBottom: '10px',
            backgroundColor: '#ffdddd',
            color: '#a00',
            border: '1px solid #a00',
            padding: '6px 12px',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
             🛑 பேசுவதை நிறுத்து (Stop Speaking)
        </button>
      <SearchBox inputText={inputText} setInputText={setInputText} onSearch={handleSearch} />
      <AnswerDisplay result={result} />
    </div>
  );
}

export default App;


