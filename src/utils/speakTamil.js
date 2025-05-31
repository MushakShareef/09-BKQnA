

// ✅ utils/speakTamil.js
const synth = window.speechSynthesis;

export function speakTamil(text) {
  if (synth.speaking) {
    synth.cancel(); // Stop any current speech before starting new
  }

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ta-IN';

  const loadVoicesAndSpeak = () => {
    const voices = synth.getVoices();
    const tamilVoice = voices.find(
      (v) => v.lang === 'ta-IN' || v.name.toLowerCase().includes('valluvar')
    );

    if (tamilVoice) {
      utter.voice = tamilVoice;
      console.log("🎤 Tamil voice used:", tamilVoice.name);
    } else {
      console.warn("⚠️ Tamil voice not found. Using default.");
    }

    synth.speak(utter);
  };

  if (synth.getVoices().length === 0) {
    synth.onvoiceschanged = loadVoicesAndSpeak;
  } else {
    loadVoicesAndSpeak();
  }
}

// ✅ New function to stop speech
export function stopTamilSpeech() {
  if (synth.speaking) {
    synth.cancel();
    console.log("🛑 Tamil speech stopped");
  }
}
