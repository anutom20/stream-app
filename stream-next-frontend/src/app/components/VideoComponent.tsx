"use client";
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(process.env.SOCKET_IO_SERVER_URL!);

const VideoComponent = () => {
  const [streamMedia, setStreamMedia] = useState<any>(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const media = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { frameRate: { ideal: 25, max: 30 } },
    });
    setStreamMedia(media);

    const streamVideo = document.getElementById(
      "streamVideo"
    ) as HTMLVideoElement;
    streamVideo.srcObject = media;
  };

  const startStreaming = () => {
    const mediaRecorder = new MediaRecorder(streamMedia, {
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 2500000,
    });

    mediaRecorder.ondataavailable = (ev) => {
      console.log("Binary Stream Available", ev.data);
      socket.emit("binarystream", ev.data);
    };

    mediaRecorder.start(25);
  };
  return (
    <div className="mt-4">
      <video id="streamVideo" autoPlay muted></video>
      <div className="p-2 flex flex-col gap-2 w-36">
        <button
          id="startButton"
          className="bg-primary-color text-black font-bold py-2 px-4 rounded"
          onClick={startStreaming}
        >
          Start
        </button>
        <button
          id="stopButton"
          className="bg-primary-color text-black font-bold py-2 px-4 rounded"
        >
          Stop
        </button>
      </div>
    </div>
  );
};

export default VideoComponent;
