import VideoComponent from "./components/VideoComponent";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-between p-24">
      <h1 className="font-extrabold text-4xl">Stream app</h1>
      <VideoComponent />
    </main>
  );
}
