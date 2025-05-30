



import React from 'react';
import { speakTamil } from '../utils/speakTamil';

function AnswerDisplay({ result }) {
  if (!result) return null; // show nothing before search

  if (result.message) {
    return <p>{result.message}</p>;
  }

  return (
    <div style={{ marginTop: '20px', textAlign: 'left', padding: '10px', background: '#fffbe6', borderRadius: '10px' }}>
      <h3>📖 பதில்:</h3>
      {/* <p>{result.answer}</p> */}
      <p>பாபா சொல்கிறார்: {result.answer}</p>
      <p style={{ fontSize: '0.9rem', color: 'gray' }}>🔖 {result.source}</p>
    </div>
  );
}


export default AnswerDisplay;

