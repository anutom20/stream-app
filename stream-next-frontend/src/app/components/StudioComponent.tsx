"use client";
import React, { useEffect, useReducer, useState } from "react";
import { Socket, io } from "socket.io-client";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/react";
import { LuCamera, LuCameraOff } from "react-icons/lu";
import { CiMicrophoneOn, CiMicrophoneOff } from "react-icons/ci";

import {
  studioComponentReducer,
  studioInitialState,
} from "../StudioComponentReducer";
import { Card } from "@nextui-org/react";

console.log("SOCKET_IO_URL", process.env.NEXT_PUBLIC_SOCKET_IO_SERVER_URL!);

const socketIoUrl = process.env.NEXT_PUBLIC_SOCKET_IO_SERVER_URL!;

const streamOptions = [
  {
    iconOn: <CiMicrophoneOn size={32} />,
    iconOff: <CiMicrophoneOff size={32} />,
    type: "MIC",
  },
  {
    iconOn: <LuCamera size={32} />,
    iconOff: <LuCameraOff size={32} />,
    type: "CAMERA",
  },
];

const StudioComponent = () => {
  const [state, dispatch] = useReducer(
    studioComponentReducer,
    studioInitialState
  );

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const cameraVideo = document.getElementById(
      "cameraVideo"
    ) as HTMLVideoElement;
    const cameraStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { frameRate: { ideal: 25, max: 30 } },
    });

    cameraVideo.srcObject = cameraStream;

    dispatch({
      type: "SET_CAMERA_STREAM",
      payload: { cameraStream, cameraVideo },
    });
  };

  const handleStreamOptionsClick = (type: string) => {
    if (type === "MIC") toggleMic();
    else if (type === "CAMERA") toggleCamera();
  };

  const toggleMic = () => {
    dispatch({ type: "TOGGLE_MIC" });
  };

  const toggleCamera = () => {
    dispatch({ type: "TOGGLE_CAMERA" });
  };

  const {
    socket,
    cameraStream,
    cameraVideo,
    mediaRecorder,
    canvasFps,
    streamKey,
    streamMedia,
    microphoneOn,
    cameraOn,
  } = state;

  const startMedia = async () => {
    const screenVideo = document.getElementById(
      "screenVideo"
    ) as HTMLVideoElement;
    const canvas = document.getElementById("videoCanvas") as HTMLCanvasElement;

    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    function drawVideo() {
      ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        cameraVideo,
        canvas.width - canvas.width * 0.2 - 10,
        canvas.height - canvas.height * 0.2 - 10,
        canvas.width * 0.2,
        canvas.height * 0.2
      );
    }

    const screenMedia = await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: { frameRate: { ideal: 25, max: 30 } },
    });

    screenVideo.srcObject = screenMedia;

    window.setInterval(() => {
      console.log("drawing frame...");
      drawVideo();
    }, 1000 / canvasFps);
  };

  const stopMedia = () => {
    if (streamMedia) {
      streamMedia!.getTracks().forEach((track: { stop: () => void }) => {
        track.stop();
      });

      dispatch({ type: "SET_STREAM_MEDIA", payload: null });
      console.log("Media stream stopped.");
    } else {
      console.log("No media stream to stop.");
    }
  };

  const streamingHandler = (type: string) => {
    if (type === "START_STREAM") {
      const socket = io(socketIoUrl, {
        query: { streamKey: streamKey },
      });

      const canvas = document.getElementById(
        "videoCanvas"
      ) as HTMLCanvasElement;

      const canvasStream = canvas.captureStream(25);

      const finalStream = new MediaStream();
      finalStream.addTrack(canvasStream.getVideoTracks()[0]);
      finalStream.addTrack(cameraStream?.getAudioTracks()[0]!);

      dispatch({ type: "SET_STREAM_MEDIA", payload: finalStream });
      const mediaRecorder = new MediaRecorder(finalStream, {
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 2500000,
      });

      dispatch({
        type: "HANDLE_STREAMING_TOGGLE",
        payload: { socket, mediaRecorder },
      });

      mediaRecorder.ondataavailable = (ev) => {
        console.log("Binary Stream Available", ev.data);
        socket.emit("binarystream", ev.data);
      };

      mediaRecorder.start(25);
    } else if (type === "STOP_STREAM") {
      socket!.emit("stopStream", "");
      mediaRecorder!.stop();
      dispatch({
        type: "HANDLE_STREAMING_TOGGLE",
        payload: { socket: null, mediaRecorder: null },
      });
    }
  };

  return (
    <div className="mt-4 flex gap-8 h-full w-full">
      <div className="flex flex-col gap-4 h-full w-1/2 m-2 fixed">
        <canvas
          id="videoCanvas"
          className="bg-secondary-background aspect-w-16 aspect-h-9 w-full  border-2 shadow-lg rounded-md border-gray-400"
        ></canvas>
        <div className="flex justify-between">
          <Input
            type="text"
            label="Stream key"
            variant="bordered"
            defaultValue="junior2nextui.org"
            isInvalid={false}
            errorMessage="Please enter a valid email"
            className="w-1/4"
            value={streamKey}
            onChange={(e) =>
              dispatch({ type: "SET_STREAM_KEY", payload: e.target.value })
            }
          ></Input>
          {streamMedia ? (
            <Button
              id="stopButton"
              className="w-36 border border-custom-yellow bg-secondary-background"
              onClick={() => streamingHandler("STOP_STREAM")}
              radius="md"
            >
              Stop
            </Button>
          ) : (
            <Button
              id="startButton"
              className="w-36 border border-custom-yellow bg-secondary-background"
              onClick={() => streamingHandler("START_STREAM")}
              radius="md"
              variant="bordered"
            >
              Start
            </Button>
          )}
        </div>
        <div className="flex gap-2 mt-2 h-28" aria-label="added-layers">
          <video
            id="cameraVideo"
            className="border-2 w-36 rounded-md shadow-lg border-gray-400"
            autoPlay
            muted
          ></video>
          <video
            id="screenVideo"
            className="border-2 w-36 rounded-md shadow-lg border-gray-400"
            autoPlay
            muted
          ></video>
        </div>
        <Card className="flex flex-row p-2 w-fit">
          {streamOptions.map((item, index) => {
            return (
              <OptionsComponent
                key={index}
                iconOn={item.iconOn}
                iconOff={item.iconOff}
                type={item.type}
                handleClick={handleStreamOptionsClick}
                cameraOn={cameraOn}
                micOn={microphoneOn}
              />
            );
          })}
        </Card>
      </div>
    </div>
  );
};

interface OptionProps {
  iconOn: any;
  iconOff: any;
  type: string;
  handleClick: (type: string) => void;
  cameraOn: boolean;
  micOn: boolean;
}
const OptionsComponent: React.FC<OptionProps> = ({
  iconOn,
  iconOff,
  type,
  handleClick,
  cameraOn,
  micOn,
}) => {
  return (
    <div
      className="flex justify-content items-center justify-content h-9 w-12  hover:cursor-pointer"
      onClick={() => handleClick(type)}
    >
      {type === "MIC" && (micOn ? iconOn : iconOff)}
      {type === "CAMERA" && (cameraOn ? iconOn : iconOff)}
    </div>
  );
};

export default StudioComponent;
