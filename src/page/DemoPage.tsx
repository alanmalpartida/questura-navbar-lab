import { useLab } from "@lab/LabContext";
import CityHero from "./sections/CityHero";
import NeighbourhoodStrip from "./sections/NeighbourhoodStrip";
import MapsBand from "./sections/MapsBand";
import PhotoMosaic from "./sections/PhotoMosaic";
import DayTimeline from "./sections/DayTimeline";
import CityNumbers from "./sections/CityNumbers";

/**
 * A long, Questurian-flavoured city page built from display sections, one per
 * file in ./sections. Gradients stand in for photography.
 */
export default function DemoPage() {
  const { showGuides, tuning } = useLab();

  return (
    <main className="relative pb-28">
      {showGuides ? <ScrollGuide collapsePx={tuning.collapsePx} /> : null}

      <CityHero />
      <div className="mt-20">
        <NeighbourhoodStrip />
      </div>
      <div className="mt-24">
        <MapsBand />
      </div>
      <div className="mt-24">
        <PhotoMosaic />
      </div>
      <div className="mt-24">
        <DayTimeline />
      </div>
      <CityNumbers />
    </main>
  );
}

/** Marks the scroll depth at which the navbar finishes collapsing. */
function ScrollGuide({ collapsePx }: { collapsePx: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-30 border-t-2 border-dashed border-[#c65d3b]"
      style={{ top: collapsePx }}
    >
      <span className="absolute right-3 top-1 rounded bg-[#c65d3b] px-2 py-0.5 font-mono text-[11px] text-white">
        scrolled {collapsePx}px → fully collapsed
      </span>
    </div>
  );
}
