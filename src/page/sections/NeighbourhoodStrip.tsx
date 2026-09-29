import { Kicker, Photo } from "../shared";

const hoods = [
  { name: "Alfama", note: "Laundry lines, fado and the oldest streets in the city.", tone: 1 },
  { name: "Príncipe Real", note: "Garden squares, concept stores and natural wine.", tone: 8 },
  { name: "Bairro Alto", note: "Quiet by day, the whole city's bar by night.", tone: 6 },
  { name: "Belém", note: "Monuments, the river and the original pastéis.", tone: 4 },
  { name: "Marvila", note: "Warehouses turned breweries, studios and galleries.", tone: 3 },
  { name: "Campo de Ourique", note: "A village inside the city, with the best market.", tone: 9 },
];

/** Light section: a sideways-scrolling row of tall numbered portrait cards. */
export default function NeighbourhoodStrip() {
  return (
    <section className="mx-auto max-w-[1400px] px-6">
      <div className="flex items-end justify-between gap-6 border-b border-foreground/20 pb-3">
        <div>
          <Kicker>Neighbourhoods</Kicker>
          <h2 className="mt-2 font-display text-3xl font-semibold text-[#25292d] 768:text-4xl">
            Six corners of the city, one at a time.
          </h2>
        </div>
        <p className="hidden shrink-0 font-[family-name:var(--font-dm-sans)] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b6a68] 640:block">
          Scroll →
        </p>
      </div>

      <div className="-mx-6 mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-6 px-6 pb-2 [scrollbar-width:none]">
        {hoods.map((h, i) => (
          <article key={h.name} className="w-[72%] shrink-0 snap-start 550:w-[280px] 1024:w-[300px]">
            <Photo i={h.tone} className="aspect-[3/4] rounded-sm">
              <span className="absolute left-4 top-3 font-display text-4xl text-[#F4F0E7]/90">
                {String(i + 1).padStart(2, "0")}
              </span>
            </Photo>
            <h3 className="mt-4 font-display text-2xl font-semibold text-[#25292d]">{h.name}</h3>
            <p className="mt-1 font-[family-name:var(--font-editorial-serif)] text-lg italic leading-snug text-[#6b6a68]">
              {h.note}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
