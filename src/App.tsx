import React, { useRef, useState } from "react";
import RecordRTC from "recordrtc";
import "./App.css"; // Import custom styles

function App() {
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const wsRef = useRef(null);
  const recorderRef = useRef(null);

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser does not support audio recording.");
      return;
    }

    wsRef.current = new WebSocket(import.meta.env.VITE_BACKEND_WS);



    wsRef.current.onmessage = (event) => {
      const message = event.data;
      if (message !== "[DONE]") {
        setTranscript((prev) => prev + message);
        console.log(message);
      } else {
        setTranscript((prev) => prev + "\n");
      }
    };

    wsRef.current.onopen = async () => {
      console.log("WebSocket connection opened");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const timeSlice = Number(import.meta.env.VITE_TIME_SLICE) || 2000;

      recorderRef.current = RecordRTC(stream, {
      type: "audio",
      mimeType: "audio/pcm", // raw PCM, no RIFF header
      recorderType: RecordRTC.StereoAudioRecorder,
      desiredSampRate: 16000,
      numberOfAudioChannels: 1,
      timeSlice: timeSlice,
      ondataavailable: (blob) => {
        blob.arrayBuffer().then((buffer) => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(buffer);
          }
        });
      },
    });

      recorderRef.current.startRecording();
      setIsRecording(true);
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  };

  const stopRecording = () => {
    recorderRef.current.stopRecording();
    wsRef.current.close();
    setIsRecording(false);
  };

  return (
    <div className="container">
      <h1 className="title">Live Audio Transcription</h1>
      <div className="button-group">
        <button onClick={startRecording} disabled={isRecording} className="start-btn">
          🎙️ Start Speaking
        </button>
        <button onClick={stopRecording} disabled={!isRecording} className="stop-btn">
          ⏹️ Stop
        </button>
      </div>
      <div className="transcript-box">
        <h2>Transcript</h2>
        <pre>{transcript || "Your transcript will appear here..."}</pre>
      </div>
    </div>
  );
}

export default App;
