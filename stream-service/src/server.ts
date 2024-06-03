import http from "http";
import { spawn } from "node:child_process";
import express, { Request, Response } from "express";
import { Server as SocketIO } from "socket.io";
import { ChildProcessWithoutNullStreams } from "child_process";
import { getFfmpegOptions } from "./utils";

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const PORT = process.env.PORT ?? 8000;

app.get("/", (req: Request, res: Response) => {
  res.send("<h1>Welcome to streaming service...</h1>");
});

const ffmpegProcessesMap: Map<string, ChildProcessWithoutNullStreams> =
  new Map();

io.on("connection", (socket) => {
  console.log("Socket Connected", socket.id);

  const streamKey = socket.handshake.query.streamKey as string;

  const options = getFfmpegOptions(streamKey);

  const ffmpegProcess = spawn("ffmpeg", options);

  ffmpegProcessesMap.set(socket.id, ffmpegProcess);

  ffmpegProcess.stdout.on("data", (data) => {
    console.log(`ffmpeg stdout: ${data}`);
  });

  ffmpegProcess.stderr.on("data", (data) => {
    console.error(`ffmpeg stderr: ${data}`);
  });

  ffmpegProcess.on("close", (code) => {
    console.log(`ffmpeg process exited with code ${code}`);
    ffmpegProcessesMap.delete(socket.id);
  });

  socket.on("binarystream", (stream) => {
    console.log("Binary Stream Incoming...");
    if (ffmpegProcess.stdin.writable) {
      ffmpegProcess.stdin.write(stream, (err) => {
        if (err) {
          console.log("Error writing to ffmpeg stdin:", err);
        }
      });
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected, reason=${reason}`);
    if (ffmpegProcessesMap.has(socket.id)) {
      console.log(`exiting ffmpeg process related to socket_id=${socket.id}`);
      ffmpegProcessesMap.get(socket.id)!.kill("SIGINT");
    }
  });

  socket.on("stopStream", () => {
    socket.disconnect();
  });
});

server.listen(PORT, () => console.log(`HTTP Server is runnning on ${PORT}`));
