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

function isManualStopError(error) {
  return (
    MANUAL_STOP_FLAG ||
    error.message === 'MANUAL_STOP' ||
    error.message.includes('interrupted')
  );
}

function waitForVoices() {
  return new Promise((resolve) => {
    let voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      resolve(voices);
      return;
    }
    const interval = setInterval(() => {
      voices = window.speechSynthesis.getVoices();
      if (voices.length) {
        clearInterval(interval);
        resolve(voices);
      }
    }, 100);
  });
}

export async function speakWithFallback(text, audioFileName) {
  if (!text) return;

  MANUAL_STOP_FLAG = false;
  console.log('🎤 Starting new speech operation');

  async function speakTTS() {
    return new Promise(async (resolve, reject) => {
      if (MANUAL_STOP_FLAG) return reject(new Error('MANUAL_STOP'));
      const synth = window.speechSynthesis;
      if (!synth) return reject(new Error('SpeechSynthesis not supported'));

      const voices = await waitForVoices();
      const tamilVoice = voices.find(
        (v) =>
          v.lang === 'ta-IN' ||
          v.lang === 'ta' ||
          v.name.toLowerCase().includes('tamil') ||
          v.name.toLowerCase().includes('valluvar')
      );

      if (!tamilVoice) {
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

  async function playAudio() {
    return new Promise((resolve, reject) => {
      if (MANUAL_STOP_FLAG) return reject(new Error('MANUAL_STOP'));

      const audio = new Audio(`/audio/${audioFileName}`);
      currentAudio = audio;

      const cleanup = () => {
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
          currentAudio = null;
        }
        updateSpeakingStatus(false);
      };

      const onEnd = () => {
        console.log('✅ Audio ended');
        cleanup();
        resolve('SUCCESS');
      };

      const onError = (e) => {
        console.log('❌ Audio error:', e);
        cleanup();
        reject(new Error('Audio playback failed'));
      };

      audio.onended = onEnd;
      audio.onerror = onError;
      audio.onplay = () => {
        if (MANUAL_STOP_FLAG) {
          audio.pause();
          cleanup();
          return reject(new Error('MANUAL_STOP'));
        }
        console.log('🔊 Audio playing');
        updateSpeakingStatus(true);
      };

      audio.play()
        .then(() => {
          if (MANUAL_STOP_FLAG) {
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

  try {
    console.log('🎯 Attempting TTS...');
    const ttsResult = await speakTTS();
    if (ttsResult === 'SUCCESS') return;
  } catch (ttsError) {
    if (isManualStopError(ttsError)) {
      console.log('🛑 TTS manually stopped – no fallback');
      return;
    }
    console.log('🔁 TTS failed, trying audio:', ttsError.message);
    try {
      const audioResult = await playAudio();
      if (audioResult === 'SUCCESS') console.log('✅ Audio fallback success');
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

export function stopAllSpeaking() {
  console.log('🚨 === MANUAL STOP INITIATED ===');
  MANUAL_STOP_FLAG = true;

  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  updateSpeakingStatus(false);
  console.log('✅ === ALL SPEAKING STOPPED ===');
}
