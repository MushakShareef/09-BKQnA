

import React, { useState, useEffect } from 'react';
import { listenTamil } from '../utils/listenTamil';
import qaData from '../qaData';
import synonymMap from '../utils/synonymMap';

function expandWithSynonyms(words) {
  const expanded = new Set();
  words.forEach(word => {
    expanded.add(word);
    const synonyms = synonymMap[word];
    if (synonyms) synonyms.forEach(s => expanded.add(s));
  });
  return Array.from(expanded);
}

function SearchBox({ inputText, setInputText, onSearch }) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!inputText.trim()) {
      setSuggestions([]);
      return;
    }

    const inputWords = expandWithSynonyms(inputText.split(/\s+/));

    const scoredMatches = qaData.map(q => {
      const questionWords = q.question.split(/\s+/);
      const overlapCount = questionWords.filter(word =>
            inputWords.some(input => word.includes(input))
      ).length;

      return { question: q.question, score: overlapCount };
    });

    const sorted = scoredMatches
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    setSuggestions(sorted.map(item => item.question));
  }, [inputText]);

  const handleSuggestionClick = (text) => {
    setInputText(text);
    setSuggestions([]);
  };

  return (
    <div className="search-box-container" style={{ position: 'relative' }}>
      <input
        type="text"
        value={inputText}
        onChange={e => setInputText(e.target.value)}
        placeholder="உங்களின் கேள்வியை இங்கு எழுதுங்கள்"
        style={{ flexGrow: 1, padding: '10px', fontSize: '1rem', borderRadius: '8px' }}
      />
      <button onClick={onSearch}>தேடு</button>
      <button className="mic-button" onClick={() => listenTamil(setInputText)}>🎤</button>

      {suggestions.length > 0 && (
        <ul className="suggestion-list" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: '4px',
          listStyle: 'none',
          margin: 0,
          padding: 0,
          zIndex: 10
        }}>
          {suggestions.map((s, i) => {
  const inputWords = expandWithSynonyms(inputText.split(/\s+/));

  // Split suggestion into words
  const parts = s.split(/\s+/).map((word, index) => {
    // Find matching part from inputWords
    const match = inputWords.find(input => word.includes(input));
    if (match) {
      const before = word.slice(0, word.indexOf(match));
      const after = word.slice(word.indexOf(match) + match.length);
      return (
        <span key={index} style={{ marginRight: '4px' }}>
          {before}
          <span style={{
            backgroundColor: '#fff176',
            fontWeight: 'bold',
            borderRadius: '4px',
            padding: '0 2px'
          }}>
            {match}
          </span>
          {after + ' '}
        </span>
      );
    } else {
      return <span key={index}>{word + ' '}</span>;
    }
  });

  return (
    <li
      key={i}
      onClick={() => handleSuggestionClick(s)}
      style={{
        padding: '8px',
        cursor: 'pointer',
        borderBottom: i < suggestions.length - 1 ? '1px solid #eee' : 'none'
      }}
    >
      {parts}
    </li>
    );
})}

        </ul>
      )}
    </div>
  );
}

export default SearchBox;


