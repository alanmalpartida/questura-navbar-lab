import { Kicker, Photo } from "../shared";

/** City header: kicker, big name, italic dek, wide lead image. */
export default function CityHero() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 pt-10 768:pt-16">
      <Kicker>City guide · Portugal</Kicker>
      <h1 className="mt-3 font-display text-[3.2rem] font-semibold leading-[0.95] text-[#25292d] 768:text-[6rem]">
        Lisbon
      </h1>
      <p className="mt-4 max-w-2xl font-[family-name:var(--font-editorial-serif)] text-xl italic text-[#6b6a68] 768:text-2xl">
        Seven hills, one river, and the best custard tart you will ever eat. Our editors' guide to the city, updated
        every season.
      </p>
      <Photo i={0} className="mt-10 aspect-[16/7] rounded-sm" />
    </section>
  );
}
