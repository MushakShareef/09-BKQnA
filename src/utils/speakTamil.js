


// ✅ utils/speakTamil.js
const synth = window.speechSynthesis;

export function speakTamil(text) {
  if (!text) return;

  if (synth.speaking) {
    synth.cancel();
  }

  const voices = synth.getVoices();
  const tamilVoice = voices.find(
    (v) => v.lang === 'ta-IN' || v.name.toLowerCase().includes('valluvar')
  );

  const paragraphs = text.split('\n\n').filter(p => p.trim()); // ✨ split on double line breaks

  const speakNext = (index) => {
    if (index >= paragraphs.length) return;

    const utter = new SpeechSynthesisUtterance(paragraphs[index].trim());
    utter.lang = 'ta-IN';
    if (tamilVoice) {
      utter.voice = tamilVoice;
      console.log("🎤 Tamil voice used:", tamilVoice.name);
    }

    utter.onend = () => {
      speakNext(index + 1);
    };

    synth.speak(utter);
  };

  if (voices.length === 0) {
    synth.onvoiceschanged = () => speakNext(0);
  } else {
    speakNext(0);
  }
}

export function stopTamilSpeech() {
  if (synth.speaking) {
    synth.cancel();
    console.log("🛑 Tamil speech stopped");
  }
}
