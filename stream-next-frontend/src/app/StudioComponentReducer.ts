import { Socket } from "socket.io-client";

interface studioTypes {
  streamMedia: MediaStream | null;
  mediaRecorder: MediaRecorder | null;
  socket: Socket | null;
  streamKey: string | null;
  cameraStream: MediaStream | null;
  cameraVideo: HTMLVideoElement | null;
  microphoneOn: boolean;
  cameraOn: boolean;
  canvasFps: number;
}

export const studioInitialState: studioTypes = {
  streamMedia: null,
  mediaRecorder: null,
  socket: null,
  streamKey: null,
  cameraStream: null,
  canvasFps: 25,
  cameraVideo: null,
  microphoneOn: true,
  cameraOn: true,
};

export function studioComponentReducer(state: any, action: any) {
  switch (action.type) {
    case "SET_STREAM_MEDIA":
      return { ...state, streamMedia: action.payload };
    case "HANDLE_STREAMING_TOGGLE":
      return {
        ...state,
        socket: action.payload.socket,
        mediaRecorder: action.payload.mediaRecorder,
      };

    case "SET_STREAM_KEY":
      return { ...state, streamKey: action.payload };
    case "SET_CAMERA_STREAM":
      return {
        ...state,
        cameraVideo: action.payload.cameraVideo,
        cameraStream: action.payload.cameraStream,
      };

    case "TOGGLE_MIC":
      return { ...state, microphoneOn: !state.microphoneOn };

    case "TOGGLE_CAMERA":
      return { ...state, cameraOn: !state.cameraOn };
    default:
      throw new Error();
  }
}
