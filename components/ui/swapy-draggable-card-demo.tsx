"use client";

import { useMemo, useState } from "react";
import { SlotItemMapArray, utils } from "swapy";
import { DragHandle, SwapyItem, SwapyLayout, SwapySlot } from "@/components/ui/swapy-draggable-card";
import { Heart, PlusCircle } from "lucide-react";

export function ProjectViewsCard() {
  return (
    <div className="bg-[#059669] text-[#fef08a] rounded-[24px] h-full p-6 flex flex-col justify-center items-center text-center shadow-lg relative select-none">
      <DragHandle className="bg-black/20 border-white/10 text-white/80 hover:text-white" />
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-[#fef08a] 2xl:text-6xl text-4xl font-extrabold tracking-tight">4.875</h2>
        <span className="text-2xl">
          <Heart className="fill-[#fef08a] text-[#fef08a]" size={28} />
        </span>
      </div>
      <p className="text-[#fef08a] font-bold text-base tracking-wide mt-1">Project Views</p>
      <p className="text-[#fef08a]/80 text-xs font-medium">last year</p>
    </div>
  );
}

export function NewUsersCard() {
  return (
    <div className="bg-[#374151] rounded-[24px] h-full p-6 flex flex-col justify-center shadow-lg relative select-none">
      <DragHandle className="bg-black/20 border-white/10 text-white/80 hover:text-white" />
      <p className="text-[#fef08a] mb-2 font-bold text-sm tracking-wide">New Users</p>
      <h2 className="text-[#fef08a] 2xl:text-6xl text-5xl font-black leading-none tracking-tight">57K</h2>
      <p className="text-[#4ade80] font-bold text-sm mt-3">+10%</p>
    </div>
  );
}

export function TeamCard() {
  return (
    <div className="bg-[#dbeafe] rounded-[24px] p-6 h-full flex flex-col justify-between relative overflow-hidden shadow-lg select-none">
      <DragHandle className="bg-blue-300/40 border-blue-400/30 text-blue-900 hover:text-black" />
      <div className="bg-[#93c5fd] text-slate-900 font-bold px-4 py-2.5 rounded-2xl inline-block mb-4 max-w-fit text-xs sm:text-sm tracking-tight shadow-sm">
        Team of passionate designers and developers
      </div>
      <div>
        <p className="font-bold text-slate-800 text-sm tracking-tight">Daily New clients</p>
        <div className="flex items-end gap-2 mt-1">
          <span className="text-6xl font-black text-slate-950 tracking-tighter leading-none">54</span>
          <span className="text-emerald-600 font-bold text-sm mb-1">+40%</span>
        </div>
      </div>
    </div>
  );
}

export function AgencyCard() {
  return (
    <div className="bg-[#d8b4fe] rounded-[24px] h-full p-5 relative overflow-hidden shadow-lg flex flex-col justify-between select-none">
      <DragHandle className="bg-purple-400/40 border-purple-500/30 text-purple-950 hover:text-black" />
      <div className="bg-[#111827] text-[#fef08a] text-base sm:text-lg font-black px-4 py-3 rounded-2xl inline-block mb-3 w-full leading-snug shadow-md">
        <p>Smart Digital</p>
        <p>Agency For Your</p>
        <p>Business</p>
      </div>
      <div className="flex gap-3 h-16 sm:h-20">
        <div className="w-full rounded-2xl bg-[#c084fc] shadow-inner"></div>
        <div className="w-full rounded-2xl bg-[#fef08a] shadow-inner ml-2"></div>
      </div>
    </div>
  );
}

export function LogoCard() {
  return (
    <div className="bg-[#fbcfe8] rounded-[24px] h-full p-6 flex flex-col items-center justify-center shadow-lg relative select-none">
      <DragHandle className="bg-pink-300/50 border-pink-400/40 text-pink-950 hover:text-black" />
      <div className="w-16 h-16 mb-3 relative">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <circle cx="33" cy="33" r="25" fill="#1b0ddd" />
          <circle cx="67" cy="33" r="25" fill="#0904ff" />
          <circle cx="50" cy="67" r="25" fill="#013de2" />
        </svg>
      </div>
      <h2 className="2xl:text-3xl text-2xl font-black text-slate-950 tracking-tight">UI-Layouts</h2>
    </div>
  );
}

export function UserTrustCard() {
  return (
    <div className="bg-[#2563eb] rounded-[24px] h-full p-5 flex flex-col justify-center items-center text-white shadow-xl relative select-none text-center">
      <DragHandle className="bg-blue-700/60 border-white/20 text-white/90 hover:text-white" />
      <h3 className="text-xl font-bold mb-0.5 tracking-tight text-white/95">Trusted By</h3>
      <p className="text-3xl font-black mb-3 tracking-tight">500+ Users</p>

      <div className="flex -space-x-2 mb-3">
        <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-[#2563eb] bg-slate-200 shadow-md">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80" alt="avatar" className="w-full h-full object-cover" />
        </div>
        <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-[#2563eb] bg-slate-200 shadow-md">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" alt="avatar" className="w-full h-full object-cover" />
        </div>
        <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-[#2563eb] bg-slate-200 shadow-md">
          <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80" alt="avatar" className="w-full h-full object-cover" />
        </div>
        <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-[#2563eb] bg-slate-200 shadow-md">
          <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&q=80" alt="avatar" className="w-full h-full object-cover" />
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#eab308] border-2 border-[#2563eb] flex items-center justify-center shadow-md">
          <PlusCircle className="w-5 h-5 text-white" />
        </div>
      </div>

      <p className="text-xs font-semibold text-blue-100">Don&apos;t Take Our Words For It...</p>
    </div>
  );
}

export function FontCard() {
  return (
    <div className="bg-[#fef08a] rounded-[24px] h-full p-6 shadow-lg relative select-none">
      <DragHandle className="bg-yellow-300/60 border-yellow-400/40 text-yellow-950 hover:text-black" />
      <h2 className="text-3xl font-black mb-0.5 text-slate-950 tracking-tight">Font</h2>
      <p className="mb-4 text-slate-700 font-bold text-sm">SK-Modernist</p>

      <div className="flex gap-2.5 mt-4">
        <div className="w-10 h-10 bg-[#1e293b] rounded-xl shadow-sm"></div>
        <div className="w-10 h-10 bg-[#94a3b8] rounded-xl shadow-sm"></div>
        <div className="w-10 h-10 bg-[#f87171] rounded-xl shadow-sm"></div>
        <div className="w-10 h-10 bg-[#f472b6] rounded-xl shadow-sm"></div>
      </div>
    </div>
  );
}

export function DesignIndustryCard() {
  return (
    <div className="bg-[#059669] text-[#fef08a] rounded-[24px] h-full p-6 flex flex-col justify-between relative shadow-lg select-none">
      <DragHandle className="bg-black/20 border-white/10 text-white/80 hover:text-white" />
      <p className="text-2xl font-black tracking-tight leading-snug">We Build Future of</p>
      <p className="text-2xl font-black tracking-tight leading-snug">Design Industry</p>
    </div>
  );
}

export function CardBalanceCard() {
  return (
    <div className="bg-[#fef08a] rounded-[24px] h-full p-6 shadow-xl relative flex flex-col justify-between select-none">
      <DragHandle className="bg-yellow-300/60 border-yellow-400/40 text-yellow-950 hover:text-black" />
      <div>
        <h3 className="text-base font-bold mb-1 text-slate-900 tracking-tight">Cards balance</h3>
        <h2 className="text-3xl font-black text-slate-950 tracking-tight">$ 12,457</h2>
      </div>

      <div className="bg-black text-white rounded-2xl p-4 shadow-md mt-4">
        <div className="flex justify-between text-xs text-slate-400 font-semibold mb-1">
          <span>Card Holder</span>
          <span>Expires</span>
        </div>
        <div className="flex justify-between font-bold text-sm text-white tracking-wide">
          <span>Robert Fox</span>
          <span>07/22</span>
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
      <div className="grid w-full grid-cols-12 gap-3 md:gap-5 py-4">
        {slottedItems.map(({ slotId, itemId }) => {
          const item = initialItems.find((i) => i.id === itemId);

          return (
            <SwapySlot
              key={slotId}
              className={`swapyItem rounded-[26px] h-64 ${item?.className}`}
              id={slotId}
            >
              <SwapyItem
                id={itemId}
                className="relative rounded-[26px] w-full h-full text-sm"
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
