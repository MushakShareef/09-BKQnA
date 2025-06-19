// ✅ utils/speakTamil.js — Fixed for delayed voice load
const synth = window.speechSynthesis;

let speakingCallback = null;

export function onSpeakStatusChange(callback) {
  speakingCallback = callback;
}

function updateSpeakingStatus(isSpeaking) {
  if (typeof speakingCallback === 'function') {
    speakingCallback(isSpeaking);
  }
}

export function speakTamil(text) {
  if (!text) return;

  if (synth.speaking) {
    synth.cancel();
  }

  // ✅ Wrap in promise to wait for voices
  const speakText = () => {
    const voices = synth.getVoices();
    const tamilVoice = voices.find(
      (v) => v.lang === 'ta-IN' || v.name.toLowerCase().includes('valluvar')
    );

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ta-IN';

    if (tamilVoice) {
      utter.voice = tamilVoice;
      console.log("🎤 Tamil voice used:", tamilVoice.name);
    } else {
      console.warn("⚠️ No Tamil voice found");
    }

    utter.onstart = () => updateSpeakingStatus(true);
    utter.onend = () => updateSpeakingStatus(false);

    synth.speak(utter);
  };

  // ✅ If voices not ready, wait for them
  if (synth.getVoices().length === 0) {
    synth.onvoiceschanged = () => {
      speakText();
    };
  } else {
    speakText();
  }
}

export function stopTamilSpeech() {
  if (synth.speaking) {
    synth.cancel();
    updateSpeakingStatus(false);
    console.log("🛑 Tamil speech stopped");
  }
}
