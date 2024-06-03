import AppNav from "../src/app/components/AppNav";
import VideoComponent from "../src/app/components/StudioComponent";
import { Divider } from "@nextui-org/divider";
import StudioComponent from "../src/app/components/StudioComponent";

export default function Home() {
  return (
    <main className="flex h-screen flex-col  p-4">
      <AppNav />
      <Divider className="" />
      <StudioComponent />
    </main>
  );
}
