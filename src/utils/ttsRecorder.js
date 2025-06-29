let mediaRecorder;
let audioChunks = [];
let lastRecordedURL = null;

// 🎤 Start recording
export async function startTTSRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.start();
    console.log("🎙️ TTS recording started");
  } catch (err) {
    console.error("🎤 Mic permission error:", err);
  }
}

// 🛑 Stop recording and return downloadable URL
export async function stopTTSRecordingAndGetURL() {
  return new Promise((resolve) => {
    if (!mediaRecorder) return resolve(null);

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(audioBlob);
      lastRecordedURL = url;
      console.log("✅ Recording complete, ready to download manually");
      resolve(url);
    };

    mediaRecorder.stop();
  });
}

// 👉 Access the last recorded voice URL
export function getLastRecordedURL() {
  return lastRecordedURL;
}
