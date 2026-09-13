"use client";

import { useMemo, useState } from "react";
import { SlotItemMapArray, utils } from "swapy";
import { DragHandle, SwapyItem, SwapyLayout, SwapySlot } from "@/components/ui/swapy-draggable-card";
import { Heart, PlusCircle } from "lucide-react";

export function ProjectViewsCard() {
  return (
    <div className="bg-emerald-600 rounded-2xl h-full p-6 flex flex-col justify-center items-center text-center shadow-md relative">
      <DragHandle />
      <div className="flex gap-2">
        <h2 className="text-yellow-200 2xl:text-5xl text-3xl font-bold mb-2">4.875</h2>
        <div className="text-yellow-200 flex items-center gap-1 mb-1">
          <span className="text-xl"><Heart className="fill-yellow-200" size={24}/></span>
        </div>
      </div>
      <p className="text-yellow-200 font-medium">Project Views</p>
      <p className="text-yellow-200/80 text-sm">last year</p>
    </div>
  );
}

export function NewUsersCard() {
  return (
    <div className="bg-gray-800 rounded-2xl h-full p-6 flex flex-col justify-center shadow-md relative border border-white/10">
      <DragHandle />
      <p className="text-cyan-300 mb-1 font-medium">New Users</p>
      <h2 className="text-white 2xl:text-6xl text-4xl font-bold leading-none">57K</h2>
      <p className="text-emerald-400 font-medium mt-2">+10%</p>
    </div>
  );
}

export function TeamCard() {
  return (
    <div className="bg-indigo-950/70 border border-indigo-500/20 rounded-2xl p-6 h-full flex flex-col justify-between relative overflow-hidden shadow-md">
      <DragHandle />
      <div className="bg-indigo-500/20 text-indigo-300 font-medium px-4 py-2 rounded-xl inline-block mb-4 max-w-fit text-xs border border-indigo-500/30">
        Team of passionate designers and developers
      </div>
      <div>
        <p className="font-bold text-zinc-300">Daily New clients</p>
        <div className="flex items-end gap-2">
          <span className="text-5xl font-bold text-white">54</span>
          <span className="text-emerald-400 font-medium mb-1">+40%</span>
        </div>
      </div>
    </div>
  );
}

export function AgencyCard() {
  return (
    <div className="bg-purple-950/60 border border-purple-500/20 rounded-2xl h-full p-4 relative overflow-hidden shadow-md flex flex-col justify-between">
      <DragHandle />
      <div className="bg-zinc-900 text-purple-200 text-sm font-medium px-4 py-2 rounded-lg inline-block mb-4 w-full border border-purple-500/30">
        <p className="font-bold">Smart Digital</p>
        <p>Agency For Your Business</p>
      </div>
      <div className="flex gap-2 h-16">
        <div className="w-full rounded-xl bg-purple-600/40 border border-purple-500/30 overflow-hidden"></div>
        <div className="w-full rounded-xl bg-cyan-600/40 border border-cyan-500/30 overflow-hidden ml-2"></div>
      </div>
    </div>
  );
}

export function LogoCard() {
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-2xl h-full p-6 flex flex-col items-center justify-center shadow-md relative">
      <DragHandle />
      <div className="w-14 h-14 mb-3">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="33" cy="33" r="25" fill="#38bdf8" />
          <circle cx="67" cy="33" r="25" fill="#818cf8" />
          <circle cx="50" cy="67" r="25" fill="#a855f7" />
        </svg>
      </div>
      <h2 className="2xl:text-2xl text-lg font-bold text-white">UI-Layouts</h2>
    </div>
  );
}

export function UserTrustCard() {
  return (
    <div className="bg-blue-600 rounded-2xl h-full p-4 flex flex-col justify-center items-center text-white shadow-lg relative">
      <DragHandle />
      <h3 className="text-xl font-bold mb-1">Trusted By</h3>
      <p className="text-2xl font-bold mb-3">500+ Users</p>

      <div className="flex -space-x-2 mb-3">
        <div className="w-8 h-8 rounded-xl overflow-hidden border-2 border-blue-600 bg-gray-200">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80" alt="avatar" className="w-full h-full object-cover" />
        </div>
        <div className="w-8 h-8 rounded-xl overflow-hidden border-2 border-blue-600 bg-gray-200">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80" alt="avatar" className="w-full h-full object-cover" />
        </div>
        <div className="w-8 h-8 rounded-xl overflow-hidden border-2 border-blue-600 bg-gray-200">
          <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&q=80" alt="avatar" className="w-full h-full object-cover" />
        </div>
        <div className="w-8 h-8 rounded-xl bg-yellow-500 border-2 border-blue-600 flex items-center justify-center">
          <PlusCircle className="w-4 h-4 text-white" />
        </div>
      </div>

      <p className="text-xs text-white/80">Don&apos;t Take Our Words For It...</p>
    </div>
  );
}

export function FontCard() {
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-2xl h-full p-6 shadow-md relative">
      <DragHandle />
      <h2 className="text-2xl font-bold mb-0.5 text-white">Font</h2>
      <p className="mb-4 text-zinc-400 text-xs font-mono">Geist / Inter</p>

      <div className="flex gap-2 mt-2">
        <div className="w-8 h-8 bg-cyan-500 rounded-md"></div>
        <div className="w-8 h-8 bg-indigo-500 rounded-md"></div>
        <div className="w-8 h-8 bg-purple-500 rounded-md"></div>
        <div className="w-8 h-8 bg-pink-500 rounded-md"></div>
      </div>
    </div>
  );
}

export function DesignIndustryCard() {
  return (
    <div className="bg-emerald-950/70 border border-emerald-500/20 text-emerald-300 rounded-2xl h-full p-6 flex flex-col justify-center relative shadow-md">
      <DragHandle />
      <p className="text-xl font-bold">We Build Future of</p>
      <p className="text-xl font-bold text-white">Design Industry</p>
    </div>
  );
}

export function CardBalanceCard() {
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-2xl h-full p-6 shadow-lg relative flex flex-col justify-between">
      <DragHandle />
      <div>
        <h3 className="text-sm font-medium mb-1 text-zinc-400">Cards balance</h3>
        <h2 className="text-2xl font-bold text-white">$ 12,457</h2>
      </div>

      <div className="bg-black text-white rounded-xl p-3 border border-white/10 mt-3">
        <div className="flex justify-between text-xs text-zinc-400 mb-1">
          <span>Card Holder</span>
          <span>Expires</span>
        </div>
        <div className="flex justify-between text-xs font-medium">
          <span>Robert Fox</span>
          <span>07/28</span>
        </div>
      </div>
    </div>
  );
}

type Item = {
  id: string;
  title: string;
  widgets: React.ReactNode;
  className?: string;
};

const initialItems: Item[] = [
  {
    id: "1",
    title: "1",
    widgets: <ProjectViewsCard />,
    className: "lg:col-span-4 sm:col-span-7 col-span-12",
  },
  { id: "2", title: "2", widgets: <NewUsersCard />, className: "lg:col-span-3 sm:col-span-5 col-span-12" },
  { id: "3", title: "3", widgets: <DesignIndustryCard />, className: "lg:col-span-5 sm:col-span-5 col-span-12" },
  { id: "4", title: "4", widgets: <TeamCard />, className: "lg:col-span-5 sm:col-span-7 col-span-12" },
  { id: "5", title: "5", widgets: <LogoCard />, className: "lg:col-span-4 sm:col-span-6 col-span-12" },
  { id: "6", title: "6", widgets: <FontCard />, className: "lg:col-span-3 sm:col-span-6 col-span-12" },
  {
    id: "7",
    title: "7",
    widgets: <AgencyCard />,
    className: "lg:col-span-4 sm:col-span-5 col-span-12",
  },
  { id: "8", title: "8", widgets: <UserTrustCard />, className: "lg:col-span-4 sm:col-span-7 col-span-12" },
  { id: "9", title: "9", widgets: <CardBalanceCard />, className: "lg:col-span-4 sm:col-span-12 col-span-12" },
];

export default function SwapyDemo() {
  const [slotItemMap, setSlotItemMap] = useState<SlotItemMapArray>(
    utils.initSlotItemMap(initialItems, "id")
  );

  const slottedItems = useMemo(
    () => utils.toSlottedItems(initialItems, "id", slotItemMap),
    [slotItemMap]
  );

  return (
    <SwapyLayout
      id="swapy-demo"
      className="w-full container mx-auto p-4"
      config={{
        swapMode: "hover",
      }}
      onSwap={(event) => {
        setSlotItemMap(event.newSlotItemMap.asArray);
      }}
    >
      <div className="grid w-full grid-cols-12 gap-3 md:gap-4 py-4">
        {slottedItems.map(({ slotId, itemId }) => {
          const item = initialItems.find((i) => i.id === itemId);

          return (
            <SwapySlot
              key={slotId}
              className={`swapyItem rounded-2xl h-56 ${item?.className}`}
              id={slotId}
            >
              <SwapyItem
                id={itemId}
                className="relative rounded-2xl w-full h-full text-sm"
                key={itemId}
              >
                {item?.widgets}
              </SwapyItem>
            </SwapySlot>
          );
        })}
      </div>
    </SwapyLayout>
  );
}
