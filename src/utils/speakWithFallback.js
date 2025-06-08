

// ✅ speakWithFallback.js (Updated with voice load fix, proper stop, and overlapping fix)

let isSpeakingCallback = null;
let currentAudio = null;
let currentUtterance = null;

let MANUAL_STOP_FLAG = false;

// 🔔 Register callback to update UI on speaking status change
export function onSpeakStatusChangeFallback(callback) {
  isSpeakingCallback = callback;
}

function updateSpeakingStatus(isSpeaking) {
  if (typeof isSpeakingCallback === 'function') {
    isSpeakingCallback(isSpeaking);
  }
}

// ✅ Helper to detect stop errors
function isManualStopError(error) {
  return (
    MANUAL_STOP_FLAG ||
    error.message === 'MANUAL_STOP' ||
    (error.message && error.message.includes('interrupted'))
  );
}

// ✅ Ensure voices are loaded before using them
function loadVoicesAsync() {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(window.speechSynthesis.getVoices());
      };
    }
  });
}

export async function speakWithFallback(text, audioFileName) {
  if (!text) return;

  stopAllSpeaking(); // ✅ stop previous speech or audio before starting
  MANUAL_STOP_FLAG = false;
  console.log('🎤 Starting new speech operation');

  // ✅ TTS using Web Speech API
  async function speakTTS() {
    return new Promise(async (resolve, reject) => {
      const synth = window.speechSynthesis;
      if (!synth) return reject(new Error('SpeechSynthesis not supported'));

      const voices = await loadVoicesAsync(); // ✅ fix: wait until voices are available

      const tamilVoice = voices.find(
        (v) =>
          v.lang === 'ta-IN' ||
          v.lang === 'ta' ||
          v.name.toLowerCase().includes('tamil') ||
          v.name.toLowerCase().includes('valluvar')
      );

      if (!tamilVoice) {
        console.log('❌ No Tamil voice found');
        return reject(new Error('No Tamil voice found'));
      }

      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ta-IN';
      utter.voice = tamilVoice;
      currentUtterance = utter;

      utter.onstart = () => {
        if (MANUAL_STOP_FLAG) {
          synth.cancel();
          return reject(new Error('MANUAL_STOP'));
        }
        console.log('🎤 TTS started');
        updateSpeakingStatus(true);
      };

      utter.onend = () => {
        console.log('✅ TTS completed');
        currentUtterance = null;
        updateSpeakingStatus(false);
        resolve('SUCCESS');
      };

      utter.onerror = (e) => {
        console.log('❌ TTS error:', e.error);
        currentUtterance = null;
        updateSpeakingStatus(false);
        if (isManualStopError(e)) return reject(new Error('MANUAL_STOP'));
        reject(new Error('TTS failed: ' + (e.error || 'Unknown error')));
      };

      try {
        synth.cancel();
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

  // ✅ Fallback: Play local audio file
  function playAudio() {
    return new Promise((resolve, reject) => {
      if (MANUAL_STOP_FLAG) {
        console.log('🛑 Skipping audio - manually stopped before start');
        return reject(new Error('MANUAL_STOP'));
      }

      const audio = new Audio(`/audio/${audioFileName}`);
      currentAudio = audio;

      const cleanup = () => {
        currentAudio = null;
        updateSpeakingStatus(false);
      };

      audio.onended = () => {
        console.log('✅ Audio ended');
        cleanup();
        resolve('SUCCESS');
      };

      audio.onerror = (e) => {
        console.log('❌ Audio error:', e);
        cleanup();
        reject(new Error('Audio playback failed'));
      };

      audio.onplay = () => {
        if (MANUAL_STOP_FLAG) {
          console.log('🛑 Audio stopped immediately');
          audio.pause();
          cleanup();
          reject(new Error('MANUAL_STOP'));
          return;
        }
        console.log('🔊 Audio playing');
        updateSpeakingStatus(true);
      };

      audio.play()
        .then(() => {
          if (MANUAL_STOP_FLAG) {
            console.log('🛑 Audio was flagged after play started');
            audio.pause();
            cleanup();
            reject(new Error('MANUAL_STOP'));
          }
        })
        .catch((err) => {
          console.log('❌ Audio play error:', err);
          cleanup();
          reject(err);
        });
    });
  }

  // 🔄 Main Logic
  try {
    console.log('🎯 Attempting TTS...');
    const ttsResult = await speakTTS();

    if (ttsResult === 'SUCCESS') {
      console.log('✅ TTS success');
      return;
    }
  } catch (ttsError) {
    if (isManualStopError(ttsError)) {
      console.log('🛑 TTS manually stopped – no fallback');
      return;
    }

    console.log('🔁 TTS failed, trying audio:', ttsError.message);

    try {
      const audioResult = await playAudio();
      if (audioResult === 'SUCCESS') {
        console.log('✅ Audio fallback success');
      }
    } catch (audioError) {
      if (isManualStopError(audioError)) {
        console.log('🛑 Audio manually stopped – done');
        return;
      }

      console.error('💥 Both TTS and audio failed:', audioError);
      alert('மன்னிக்கவும், பேசும் ஒலி இல்லை..');
    }
  }
}

// ✅ Manual Stop (call this on Stop button)
export function stopAllSpeaking() {
  console.log('🚨 === MANUAL STOP INITIATED ===');
  MANUAL_STOP_FLAG = true;

  // Stop TTS
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }

  // Stop audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  updateSpeakingStatus(false);
  console.log('✅ === ALL SPEAKING STOPPED ===');
}
