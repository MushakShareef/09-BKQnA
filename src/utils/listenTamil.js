



export function listenTamil(setInputText) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("உங்கள் உலாவி சிப்பிச் அடையாளத்தை (Speech Recognition) ஆதரிக்கவில்லை.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'ta-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setInputText(transcript); // update search input with what was spoken
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    alert("மன்னிக்கவும், உங்கள் குரலை படிக்க முடியவில்லை.");
  };
}
