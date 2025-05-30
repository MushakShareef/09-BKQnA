






export function speakTamil(text) {
  const synth = window.speechSynthesis;
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
    // Voices not loaded yet, wait
    synth.onvoiceschanged = loadVoicesAndSpeak;
  } else {
    loadVoicesAndSpeak();
  }
}
