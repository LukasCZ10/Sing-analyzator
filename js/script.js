const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const output = document.getElementById('output');

let mediaRecorder;
let audioChunks = [];

// Spustí nahrávání
startButton.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const audioArrayBuffer = await audioBlob.arrayBuffer();

      analyzeAudio(audioArrayBuffer); // Zavolá funkci pro analýzu zvuku
    };

    audioChunks = [];
    mediaRecorder.start();
    output.textContent = 'Nahrávání...';
  } catch (err) {
    output.textContent = 'Chyba při přístupu k mikrofonu!';
    console.error('Chyba při získávání mikrofonu:', err);
  }
});

// Zastaví nahrávání
stopButton.addEventListener('click', () => {
  mediaRecorder.stop();
  output.textContent = 'Analyzuji zvuk...';
});

// Funkce pro analýzu zvuku pomocí Magenta.js
async function analyzeAudio(audioBuffer) {
  try {
    const model = new mm.OnsetsAndFrames();
    await model.initialize(); // Načte model Magenta.js

    const audioCtx = new AudioContext();
    const decodedAudio = await audioCtx.decodeAudioData(audioBuffer); // Dekóduje audio data

    const pianoRoll = await model.transcribeFromAudioBuffer(decodedAudio); // Analyzuje zvuk
    output.textContent = `Analyzováno: ${pianoRoll.notes.length} not.`;

    console.log('Výsledek analýzy:', pianoRoll); // Výsledek analýzy (seznam not)
  } catch (err) {
    output.textContent = 'Chyba při analýze zvuku.';
    console.error('Chyba při analýze:', err);
  }
}
