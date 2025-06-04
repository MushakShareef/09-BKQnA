

// ✅ utils/playTamilAudio.js

let currentAudio = null;
let speakingCallback = null;

// 🌟 Let React listen to play/stop
export function onSpeakStatusChange(callback) {
  speakingCallback = callback;
}

function updateSpeakingStatus(isSpeaking) {
  if (typeof speakingCallback === 'function') {
    speakingCallback(isSpeaking);
  }
}

// 🔊 Play your pre-recorded Tamil MP3 file
export function playTamilAudio(fileName) {
  stopTamilAudio(); // ⛔ Stop if already playing

  // const audio = new Audio(`/audio/${fileName}`);
  const audio = new Audio(`/audio/${encodeURIComponent(fileName)}`);
  console.log("🎧 Audio URL is:", `/audio/${encodeURIComponent(fileName)}`);

  currentAudio = audio;

  audio.onplay = () => {
    updateSpeakingStatus(true); // ✅ Start animation
    console.log("🔊 Tamil audio playing:", fileName);
  };

  audio.onended = () => {
    updateSpeakingStatus(false); // ✅ Stop animation
    console.log("✅ Tamil audio finished");
  };

  audio.onerror = () => {
    alert("மன்னிக்கவும், இந்த கேள்விக்கான ஒலி கிடைக்கவில்லை.");
    updateSpeakingStatus(false);
  };

  audio.play();
}

// ⛔ Stop current audio
export function stopTamilAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    updateSpeakingStatus(false);
    currentAudio = null;
    console.log("🛑 Tamil audio stopped");
  }
}
