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
    </div>
  </section>
);

export default Hero;
