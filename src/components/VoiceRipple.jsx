

// ✅ components/VoiceRipple.jsx
import React from 'react';
import './VoiceRipple.css';

function VoiceRipple({ isSpeaking }) {
  return (
    <div className={`ripple-wrapper ${isSpeaking ? 'active' : ''}`}>
      <div className="ripple-circle" />
      <div className="ripple-circle delay1" />
      <div className="ripple-circle delay2" />
    </div>
  );
}

export default VoiceRipple;
