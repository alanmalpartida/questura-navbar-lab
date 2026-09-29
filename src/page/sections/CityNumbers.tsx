import { Kicker, Photo } from "../shared";

const stats = [
  { value: "7", label: "Hills", note: "Bring shoes you can actually walk in." },
  { value: "€1.20", label: "A bica at the counter", note: "Sit down and it costs a little more." },
  { value: "28", label: "The tram worth waiting for", note: "Board at the first stop, not the third." },
  { value: "2,800", label: "Hours of sun a year", note: "Among the sunniest capitals in Europe." },
  { value: "1755", label: "The earthquake", note: "It remade the whole of the Baixa." },
  { value: "25 min", label: "Train to the beach", note: "From Cais do Sodré, every twenty minutes." },
];

/** Warm band: portrait image beside a grid of big numerals. */
export default function CityNumbers() {
  return (
    <section className="bg-background-warm py-20">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 1024:grid-cols-[5fr_7fr] 1024:gap-16">
        <div className="flex flex-col">
          <Kicker>Know before you go</Kicker>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-[#25292d] 768:text-5xl">
            Lisbon, by the numbers.
          </h2>
          <p className="mt-4 max-w-md font-[family-name:var(--font-editorial-serif)] text-xl italic text-[#6b6a68]">
            Six figures that explain more about the city than any guidebook chapter.
          </p>
          <Photo i={7} className="mt-10 aspect-[16/9] rounded-sm 768:aspect-[2/1] 1024:mt-auto 1024:aspect-auto 1024:min-h-[320px] 1024:flex-1" />
        </div>

        <dl className="grid gap-x-10 gap-y-10 550:grid-cols-2 1024:content-center">
          {stats.map((s) => (
            <div key={s.label} className="border-t border-foreground/20 pt-5">
              <dt className="font-display text-5xl font-semibold leading-none text-terracotta 768:text-6xl">{s.value}</dt>
              <dd className="m-0 mt-3">
                <p className="font-display text-lg font-semibold text-[#25292d]">{s.label}</p>
                <p className="mt-1 text-sm text-[#6b6a68]">{s.note}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
