import heroImage from '../src/assets/mara4.png';

const Hero = () => (
  <section
    className="relative h-[calc(100vh-80px)] w-full flex items-center overflow-hidden"
    aria-label="Hero — Colección MARA"
  >
    {/* ── Background image layer ── */}
    <div className="absolute inset-0 z-0 bg-stone-100 flex items-center justify-center">
      <img
        className="w-full h-full max-w-full max-h-full object-contain"
        src={heroImage}
        alt="Bolso de lujo MARA sobre fondo editorial"
      />
    </div>

    {/* ── Foreground content ── */}
    <div className="relative z-10 w-full max-w-[1440px] mx-auto px-5 md:px-[80px]">
      <div className="max-w-2xl">
        {/* Display headline — Bodoni Moda, 64 px desktop / 32 px mobile */}
        <h1
          className="font-display-lg text-headline-lg-mobile md:text-display-lg
                     text-stone-900 mb-8 tracking-tight"
        >
          DISEÑADA PARA DESTACAR
        </h1>

        <a
          href="#collection"
          className="inline-block border-2 border-stone-900 text-stone-900
                     px-10 py-4
                     font-label-lg text-label-lg
                     uppercase tracking-widest
                     hover:bg-stone-900 hover:text-stone-100
                     transition-all duration-500"
        >
          Descubre la Colección
        </a>
      </div>
    </div>
  </section>
);

export default Hero;
