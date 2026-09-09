import Link from "next/link";
import { TriageTool } from "@/components/TriageTool";

export default function ToolPage() {
  return <div className="min-h-screen bg-[#071014] text-white"><div className="border-b border-white/10 bg-[#071014]/90 px-5 py-4 backdrop-blur"><div className="mx-auto flex max-w-5xl items-center justify-between"><Link className="text-sm font-semibold text-zinc-300 transition hover:text-lime-300" href="/">← Back to HotPots</Link><span className="text-sm font-semibold tracking-[-.05em]">hot<span className="text-lime-300">pots</span></span></div></div><TriageTool /></div>;
}
