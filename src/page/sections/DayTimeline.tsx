import { Kicker, Photo } from "../shared";

const stops = [
  { time: "08:00", title: "A pastel de nata, standing up", place: "Manteigaria, Chiado", tone: 4 },
  { time: "11:00", title: "The 28 before the crowds", place: "Martim Moniz → Prazeres", tone: 0 },
  { time: "14:00", title: "Grilled fish and vinho verde", place: "A tasca in Mouraria", tone: 9 },
  { time: "18:30", title: "Sunset from the highest hill", place: "Miradouro da Senhora do Monte", tone: 7 },
  { time: "22:00", title: "Fado, then one more glass", place: "Alfama", tone: 6 },
];

/** Dark forest band: one day as a row of timed stops on a shared rule. */
export default function DayTimeline() {
  return (
    <section className="bg-[#1f3329] py-20 text-[#F4F0E7]">
      <div className="mx-auto max-w-[1400px] px-6">
        <Kicker className="text-ochre">A perfect day</Kicker>
        <h2 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight 768:text-5xl">
          Twenty-four hours, planned by someone who lives here.
        </h2>

        <ol className="mt-12 grid gap-10 768:grid-cols-5 768:gap-0">
          {stops.map((s, i) => (
            <li key={s.time} className="768:pr-6">
              <p className="font-display text-3xl text-ochre">{s.time}</p>
              <div className="relative mt-4 border-t border-white/20">
                <span className="absolute -top-[5px] left-0 size-[9px] rounded-full bg-ochre" />
              </div>
              <Photo i={s.tone} className="mt-6 aspect-[16/9] rounded-sm opacity-85 768:aspect-[4/5]" />
              <p className="mt-4 font-[family-name:var(--font-dm-sans)] text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
                Stop {i + 1}
              </p>
              <h3 className="mt-1 font-display text-xl leading-snug">{s.title}</h3>
              <p className="mt-1 font-[family-name:var(--font-editorial-serif)] text-lg italic text-white/60">{s.place}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
