


// ✅ utils/speakTamil.js
const synth = window.speechSynthesis;

let speakingCallback = null;

// 🔔 React can register to get speaking updates
export function onSpeakStatusChange(callback) {
  speakingCallback = callback;
}

function updateSpeakingStatus(isSpeaking) {
  if (typeof speakingCallback === 'function') {
    speakingCallback(isSpeaking);
  }
}

// 🎤 Speak Tamil paragraph-by-paragraph
export function speakTamil(text) {
  if (!text) return;

  if (synth.speaking) {
    synth.cancel();
  }

  const voices = synth.getVoices();
  const tamilVoice = voices.find(
    (v) => v.lang === 'ta-IN' || v.name.toLowerCase().includes('valluvar')
  );

  const paragraphs = text.split('\n\n').filter(p => p.trim());

  const speakNext = (index) => {
    if (index >= paragraphs.length) {
      updateSpeakingStatus(false); // ✅ All done
      return;
    }

    const utter = new SpeechSynthesisUtterance(paragraphs[index].trim());
    utter.lang = 'ta-IN';

    if (tamilVoice) {
      utter.voice = tamilVoice;
      console.log("🎤 Tamil voice used:", tamilVoice.name);
    }

    utter.onstart = () => {
      if (index === 0) {
        updateSpeakingStatus(true); // ✅ Start animation only once
      }
    };

    utter.onend = () => {
      speakNext(index + 1); // ➡️ Next paragraph
    };

    synth.speak(utter);
  };

  if (voices.length === 0) {
    synth.onvoiceschanged = () => speakNext(0);
  } else {
    speakNext(0);
  }
}

// ⛔ Stop speaking + ripple
export function stopTamilSpeech() {
  if (synth.speaking) {
    synth.cancel();
    updateSpeakingStatus(false);
    console.log("🛑 Tamil speech stopped");
  }
}
