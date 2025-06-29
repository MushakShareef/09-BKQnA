

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';

function AnswerDisplay({ result, questionText, voiceDownloadUrl }) {

  const answerRef = useRef();

  if (!result) return null;

  if (result.message) {
    return <p>{result.message}</p>;
  }

  // 📥 Download image
  const handleDownloadImage = async () => {
    const element = answerRef.current;
    if (!element) return;

    const canvas = await html2canvas(element);
    const image = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = image;
    link.download = 'gnani_answer.png';
    link.click();
  };

  return (
    <div>
      <div
         ref={answerRef}
          style={{
            marginTop: '20px',
            textAlign: 'left',
            padding: '10px',
            background: '#fffbe6',
            borderRadius: '10px'
          }}
>
          <p style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#5c3d00' }}>
            ❓ கேள்வி: {questionText}
          </p>

          <h3>📖 பதில்:</h3>

          {result.answer.split('\n\n').map((para, index) => (
            <p key={index} style={{ marginBottom: '1rem' }}>
              பாபா சொல்கிறார்: {para}
            </p>
          ))}

          <p style={{ fontSize: '0.9rem', color: 'gray' }}>🔖 {result.source}</p>
      </div>


      <button onClick={handleDownloadImage} style={{ marginTop: '10px' }}>
        🖼️ பதிலை படம் வடிவில் சேமிக்க (Download Answer as Image)
      </button>
      {voiceDownloadUrl && (
         <a href={voiceDownloadUrl} download="gnani_voice.webm">
         <button style={{ marginTop: '10px' }}>
        🎧 பதிவான குரல் (Download TTS Voice)
         </button>
         </a>
)}

    </div>
  );
}

export default AnswerDisplay;
