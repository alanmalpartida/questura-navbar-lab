import { Kicker, Photo } from "../shared";

/** Dark navy band: four framed category cards. */
export default function MapsBand() {
  return (
    <section className="bg-[#031522] py-20 text-[#F4F0E7]">
      <div className="mx-auto max-w-[1400px] px-6">
        <Kicker className="text-accent-soft">Questurian maps</Kicker>
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
  );
}
