"use client";

import React, { useRef, useState } from "react";
import * as faceapi from "face-api.js";
import styles from "./page.module.css";

export default function Page() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [chunks, setChunks] = useState([]);

  const startCamera = async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    videoRef.current.play();
    detectFaces();
  };

  const stopCamera = () => {
    const stream = videoRef.current.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    videoRef.current.srcObject = null;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const detectFaces = () => {
    const interval = setInterval(async () => {
      if (videoRef.current.paused || videoRef.current.ended) {
        clearInterval(interval);
        return;
      }
      const detections = await faceapi.detectAllFaces(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      );
      const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current);
      const resized = faceapi.resizeResults(detections, dims);
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      faceapi.draw.drawDetections(canvasRef.current, resized);
    }, 100);
  };

  const startRecording = () => {
    const stream = canvasRef.current.captureStream(30);
    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) setChunks((prev) => [...prev, e.data]);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        localStorage.setItem("recordedFaceVideo", reader.result);
      };
    };
    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  // function to clear local storage

  const clearLocalStorage = () => {
    localStorage.clear();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Face Tracking with Recording</h1>
      <div className={styles.videoWrapper}>
        <video
          ref={videoRef}
          className={styles.video}
          autoPlay
          muted
          playsInline
        ></video>
        <canvas ref={canvasRef} className={styles.canvas}></canvas>
      </div>
      <div className={styles.buttonGroup}>
        <button
          onClick={startCamera}
          className={`${styles.button} ${styles.start}`}
        >
          Start Camera
        </button>
        <button
          onClick={stopCamera}
          className={`${styles.button} ${styles.stop}`}
        >
          Stop Camera
        </button>
        {!recording ? (
          <button
            onClick={startRecording}
            className={`${styles.button} ${styles.start}`}
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className={`${styles.button} ${styles.stop}`}
          >
            Stop Recording
          </button>
        )}
      </div>
    </div>
  );
}
