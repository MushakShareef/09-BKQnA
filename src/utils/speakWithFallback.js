

let isSpeakingCallback = null;
let currentAudio = null;
let currentUtterance = null;

let MANUAL_STOP_FLAG = false;

export function onSpeakStatusChangeFallback(callback) {
  isSpeakingCallback = callback;
}

function updateSpeakingStatus(isSpeaking) {
  if (typeof isSpeakingCallback === 'function') {
    isSpeakingCallback(isSpeaking);
  }
}

// Helper to detect manual stop
function isManualStopError(error) {
  return (
    MANUAL_STOP_FLAG ||
    error.message === 'MANUAL_STOP' ||
    error.message.includes('interrupted')
  );
}

export async function speakWithFallback(text, audioFileName) {
  if (!text) return;

  MANUAL_STOP_FLAG = false;
  console.log('🎤 Starting new speech operation');

  function speakTTS() {
    return new Promise((resolve, reject) => {
      if (MANUAL_STOP_FLAG) {
        console.log('🛑 TTS cancelled - manual stop detected');
        reject(new Error('MANUAL_STOP'));
        return;
      }

      const synth = window.speechSynthesis;
      if (!synth) {
        reject(new Error('SpeechSynthesis not supported'));
        return;
      }

      const voices = synth.getVoices();
      const tamilVoice = voices.find(
        (v) =>
          v.lang === 'ta-IN' ||
          v.lang === 'ta' ||
          v.name.toLowerCase().includes('tamil') ||
          v.name.toLowerCase().includes('valluvar')
      );

      if (!tamilVoice) {
        console.log('❌ No Tamil voice found');
        reject(new Error('No Tamil voice found'));
        return;
      }

      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ta-IN';
      utter.voice = tamilVoice;
      currentUtterance = utter;

      utter.onstart = () => {
        if (MANUAL_STOP_FLAG) {
          console.log('🛑 TTS stopped at start');
          synth.cancel();
          reject(new Error('MANUAL_STOP'));
          return;
        }
        console.log('🎤 TTS started');
        updateSpeakingStatus(true);
      };

      utter.onend = () => {
        console.log('✅ TTS completed naturally');
        currentUtterance = null;
        updateSpeakingStatus(false);
        resolve('SUCCESS');
      };

      utter.onerror = (e) => {
        console.log('❌ TTS error:', e.error);
        currentUtterance = null;
        updateSpeakingStatus(false);

        if (MANUAL_STOP_FLAG || e.error === 'interrupted') {
          console.log('🛑 TTS error due to manual stop or interruption');
          reject(new Error('MANUAL_STOP'));
        } else {
          console.log('💥 TTS genuine error');
          reject(new Error('TTS failed: ' + (e.error || 'Unknown error')));
        }
      };

      try {
        synth.cancel(); // Clear any ongoing speech
        if (!MANUAL_STOP_FLAG) {
          synth.speak(utter);
        } else {
          reject(new Error('MANUAL_STOP'));
        }
      } catch (e) {
        currentUtterance = null;
        reject(new Error('TTS speak failed'));
      }
    });
  }

  function playAudio() {
    return new Promise((resolve, reject) => {
      if (MANUAL_STOP_FLAG) {
        console.log('🛑 Audio cancelled - manual stop detected');
        reject(new Error('MANUAL_STOP'));
        return;
      }

      const audio = new Audio(`/audio/${audioFileName}`);
      currentAudio = audio;

      audio.onplay = () => {
        if (MANUAL_STOP_FLAG) {
          console.log('🛑 Audio stopped at play');
          audio.pause();
          reject(new Error('MANUAL_STOP'));
          return;
        }
        console.log('🔊 Audio started playing');
        updateSpeakingStatus(true);
      };

      audio.onended = () => {
        console.log('✅ Audio completed naturally');
        currentAudio = null;
        updateSpeakingStatus(false);
        resolve('SUCCESS');
      };

      audio.onerror = (e) => {
        console.log('❌ Audio error:', e);
        currentAudio = null;
        updateSpeakingStatus(false);
        if (MANUAL_STOP_FLAG) {
          console.log('🛑 Audio error due to manual stop');
          reject(new Error('MANUAL_STOP'));
        } else {
          reject(new Error('Audio playback failed'));
        }
      };

      audio.play().catch((playError) => {
        currentAudio = null;
        updateSpeakingStatus(false);
        if (MANUAL_STOP_FLAG) {
          reject(new Error('MANUAL_STOP'));
        } else {
          reject(playError);
        }
      });
    });
  }

  // === MAIN EXECUTION ===
  try {
    console.log('🎯 Attempting TTS...');
    const ttsResult = await speakTTS();

    if (ttsResult === 'SUCCESS') {
      console.log('✅ TTS completed successfully');
      return;
    }
  } catch (ttsError) {
    if (isManualStopError(ttsError)) {
      console.log('🛑 Manual stop detected after TTS - NO FALLBACK');
      return;
    }

    console.log('🔄 TTS failed unexpectedly, attempting audio fallback:', ttsError.message);

    try {
      const audioResult = await playAudio();
      if (audioResult === 'SUCCESS') {
        console.log('✅ Audio fallback completed successfully');
      }
    } catch (audioError) {
      if (isManualStopError(audioError)) {
        console.log('🛑 Manual stop detected during audio - NO ACTION');
        return;
      }

      console.error('💥 Both TTS and audio failed:', audioError);
      alert('மன்னிக்கவும், பேசும் ஒலி இல்லை..');
    }
  }
}

export function stopAllSpeaking() {
  console.log('🚨 === MANUAL STOP INITIATED ===');
  MANUAL_STOP_FLAG = true;

  if (window.speechSynthesis) {
    console.log('🛑 Stopping TTS directly');
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }

  if (currentAudio) {
    console.log('🛑 Stopping audio directly');
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  updateSpeakingStatus(false);
  console.log('✅ === ALL SPEAKING STOPPED MANUALLY ===');
}
