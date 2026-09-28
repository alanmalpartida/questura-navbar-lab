import { useLab } from "@lab/LabContext";

/**
 * A long, Questurian-flavoured city page. Its only job is to give the navbar
 * something real-looking to scroll over; nothing here is meant to be ported.
 */

const tones = [
  "linear-gradient(135deg,#c65d3b 0%,#d4a574 100%)",
  "linear-gradient(135deg,#2d4a3e 0%,#8aa38f 100%)",
  "linear-gradient(135deg,#3b5bdb 0%,#9db0f2 100%)",
  "linear-gradient(135deg,#25292d 0%,#6b6a68 100%)",
  "linear-gradient(135deg,#d4a574 0%,#f5f0e8 100%)",
  "linear-gradient(135deg,#7a3b2e 0%,#c65d3b 100%)",
];

const featured = [
  { kicker: "Neighbourhoods", title: "Alfama after dark: a slow walk through the old city", by: "Marta Sousa" },
  { kicker: "Eat", title: "The twelve tascas worth crossing town for", by: "João Ferreira" },
  { kicker: "Itinerary", title: "Three days, no car, one very good tram", by: "Ana Lima" },
  { kicker: "Stay", title: "Small hotels with big views over the Tagus", by: "Rui Costa" },
  { kicker: "Culture", title: "Where fado still sounds like it used to", by: "Inês Rocha" },
];

const list = [
  "Pastéis at dawn: the bakeries that open first",
  "A local's map of the miradouros",
  "Belém without the queues",
  "The LX Factory, honestly reviewed",
  "Day trip: Sintra by train and on foot",
  "Natural wine bars in Príncipe Real",
  "Tiles, markets and the Feira da Ladra",
  "Swimming spots along the Linha de Cascais",
];

function Photo({ i, className = "" }: { i: number; className?: string }) {
  return <div className={`w-full ${className}`} style={{ background: tones[i % tones.length] }} aria-hidden />;
}

function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <header className="mb-8 border-b border-foreground/20 pb-3">
      <p className="font-[family-name:var(--font-dm-sans)] text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
        {kicker}
      </p>
      <h2 className="mt-2 font-display text-3xl font-semibold text-[#25292d] 768:text-4xl">{title}</h2>
    </header>
  );
}

export default function DemoPage() {
  const { showGuides, tuning } = useLab();

  return (
    <main className="relative">
      {showGuides ? <ScrollGuide collapsePx={tuning.collapsePx} /> : null}

      {/* Hero */}
      <section className="mx-auto max-w-[1400px] px-6 pt-10 768:pt-16">
        <p className="font-[family-name:var(--font-dm-sans)] text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
          City guide · Portugal
        </p>
        <h1 className="mt-3 font-display text-[3.2rem] font-semibold leading-[0.95] text-[#25292d] 768:text-[6rem]">
          Lisbon
        </h1>
        <p className="mt-4 max-w-2xl font-[family-name:var(--font-editorial-serif)] text-xl italic text-[#6b6a68] 768:text-2xl">
          Seven hills, one river, and the best custard tart you will ever eat. Our editors' guide to the city,
          updated every season.
        </p>
        <Photo i={0} className="mt-10 aspect-[16/7] rounded-sm" />
      </section>

      {/* Featured */}
      <section className="mx-auto mt-20 max-w-[1400px] px-6">
        <SectionHeading kicker="Featured" title="This season in Lisbon" />
        <div className="grid gap-8 768:grid-cols-2 1024:grid-cols-3">
          {featured.map((a, i) => (
            <article key={a.title} className={i === 0 ? "768:col-span-2 1024:row-span-2" : ""}>
              <Photo i={i + 1} className={i === 0 ? "aspect-[4/3]" : "aspect-[3/2]"} />
              <p className="mt-4 font-[family-name:var(--font-dm-sans)] text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                {a.kicker}
              </p>
              <h3 className={`mt-1 font-display font-semibold leading-tight text-[#25292d] ${i === 0 ? "text-3xl" : "text-xl"}`}>
                {a.title}
              </h3>
              <p className="mt-2 text-sm text-[#6b6a68]">By {a.by}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Dark band */}
      <section className="mt-24 bg-[#031522] py-20 text-[#F4F0E7]">
        <div className="mx-auto max-w-[1400px] px-6">
          <p className="font-[family-name:var(--font-dm-sans)] text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-soft">
            Questurian maps
          </p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight 768:text-5xl">
            Every place we recommend, on one map you can take with you.
          </h2>
          <div className="mt-10 grid gap-4 768:grid-cols-4">
            {["Eat", "Drink", "See", "Stay"].map((t, i) => (
              <div key={t} className="rounded-sm border border-white/10 p-5">
                <Photo i={i + 2} className="aspect-square rounded-sm opacity-80" />
                <p className="mt-3 font-display text-xl">{t}</p>
                <p className="text-sm text-white/60">{12 + i * 7} places</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Long list */}
      <section className="mx-auto mt-24 max-w-[1400px] px-6">
        <SectionHeading kicker="The guide" title="Everything else worth reading" />
        <ol className="divide-y divide-foreground/15">
          {[...list, ...list].map((t, i) => (
            <li key={i} className="grid grid-cols-[3rem_1fr] items-start gap-4 py-6 768:grid-cols-[4rem_1fr_220px]">
              <span className="font-display text-3xl text-[#c65d3b]">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-display text-2xl font-semibold text-[#25292d]">{t}</h3>
                <p className="mt-2 max-w-2xl text-[#6b6a68]">
                  A short dek goes here, the kind of line that tells you why this one is worth your ten minutes and
                  what you will know by the end of it.
                </p>
              </div>
              <Photo i={i} className="hidden aspect-[3/2] rounded-sm 768:block" />
            </li>
          ))}
        </ol>
      </section>

      {/* Newsletter */}
      <section className="mx-auto mt-24 max-w-[1400px] px-6">
        <div className="bg-[#EFE9DE] px-8 py-16 text-center">
          <h2 className="font-display text-4xl font-semibold text-[#25292d]">The Sunday Dispatch</h2>
          <p className="mx-auto mt-3 max-w-xl font-[family-name:var(--font-editorial-serif)] text-xl italic text-[#6b6a68]">
            One city, one long read, every Sunday morning.
          </p>
        </div>
      </section>

      <footer className="mt-24 border-t border-black/10 bg-[#ece9e3] px-6 py-16 text-center">
        <p className="font-display text-2xl font-semibold uppercase tracking-[0.12em] text-[#25292d]">Questurian</p>
        <p className="mt-2 text-sm text-[#6b6a68]">Navbar Lab · not the real site</p>
      </footer>
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
