import { Kicker, Photo } from "../shared";

// Spans fill a 4×3 grid on desktop and a 2-wide stack on phones.
const frames = [
  { caption: "The 28 tram, climbing out of Graça", tone: 0, span: "col-span-2 row-span-2" },
  { caption: "Azulejos, Rua da Mouraria", tone: 2, span: "" },
  { caption: "The Tagus at low tide", tone: 9, span: "row-span-2" },
  { caption: "Ginjinha, Largo de São Domingos", tone: 5, span: "" },
  { caption: "Cais das Colunas, just before sunset", tone: 7, span: "col-span-2" },
  { caption: "Estufa Fria", tone: 1, span: "" },
  { caption: "Lx Factory, Sunday", tone: 3, span: "" },
];

/** Light section: an asymmetric grid of frames with captions laid over them. */
export default function PhotoMosaic() {
  return (
    <section className="mx-auto max-w-[1400px] px-6">
      <div className="grid gap-4 border-b border-foreground/20 pb-3 768:grid-cols-[1fr_auto] 768:items-end">
        <div>
          <Kicker>In pictures</Kicker>
          <h2 className="mt-2 font-display text-3xl font-semibold text-[#25292d] 768:text-4xl">Lisbon in seven frames</h2>
        </div>
        <p className="max-w-sm font-[family-name:var(--font-editorial-serif)] text-lg italic text-[#6b6a68] 768:text-right">
          Shot over one long weekend in late September, when the light goes gold at five.
        </p>
      </div>

      <div className="mt-8 grid grid-flow-dense auto-rows-[140px] grid-cols-2 gap-3 768:auto-rows-[190px] 768:grid-cols-4">
        {frames.map((f, i) => (
          <figure key={f.caption} className={`m-0 ${f.span}`}>
            <Photo i={f.tone} className="h-full rounded-sm">
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-4 pb-3 pt-10 text-[#F4F0E7]">
                <span className="block font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F4F0E7]/70">
                  Fig. {i + 1}
                </span>
                <span className="font-[family-name:var(--font-editorial-serif)] text-base italic leading-tight 768:text-lg">
                  {f.caption}
                </span>
              </figcaption>
            </Photo>
          </figure>
        ))}
      </div>
    </section>
  );
}
