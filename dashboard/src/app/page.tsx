import Timeline from "@/components/Timeline";
import ContextPanel from "@/components/ContextPanel";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="w-full h-full flex flex-col">
      <Header />
      <div className="flex-1 w-full flex flex-col lg:flex-row gap-6 overflow-hidden pb-6">
        <div className="w-full lg:w-2/3 h-full">
          <Timeline />
        </div>
        <div className="w-full lg:w-1/3 h-full">
          <ContextPanel />
        </div>
      </div>
    </div>
  );
}
