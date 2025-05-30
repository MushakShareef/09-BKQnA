



import React, { useState } from 'react';
import './App.css';
import SearchBox from './components/SearchBox';
import AnswerDisplay from './components/AnswerDisplay';
import qaData from './qaData';
import { speakTamil } from './utils/speakTamil';



function App() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);

  function handleSearch() {
    const query = inputText.trim();

    if (!query) {
    setResult({ message: "தயவுசெய்து ஒரு கேள்வியை உள்ளிடுங்கள்." });
    return;
   }

    const matchedQA = qaData.find(qa =>
    query.includes(qa.question.slice(0, 5)) || qa.question.includes(query)
   );

    if (matchedQA) {
    setResult({
      answer: matchedQA.answer,
      source: matchedQA.source
    });

    const fullAnswer = `பாபா சொல்கிறார்:  ${matchedQA.answer} (${matchedQA.source})`;
    speakTamil(fullAnswer);
    } else {
    setResult({ message: "மன்னிக்கவும், பதில் காணவில்லை." });
   }
  }


 

  return (
    <div className="app-container">
      <h3>☀️ பிரம்மா குமாரிகள் கேள்வி-பதில்கள்</h3>
      <img 
        src="/images/baba.png" 
        alt="Shiva Baba" 
        width={150}
        height={157}
        style={{ borderRadius: '10px', marginTop: '10px' }} 
      />
      <p>உங்களின் ஆன்மீக சந்தேகங்களை கேளுங்கள் அல்லது தமிழில் எழுதுங்கள் :</p>
      <SearchBox 
        inputText={inputText} 
        setInputText={setInputText} 
        onSearch={handleSearch} 
      />
      <AnswerDisplay result={result} />
    </div>
  );

}
export default App;
