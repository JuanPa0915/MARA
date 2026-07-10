/**
 * BrandStatement
 * ──────────────
 * Centered editorial block expressing MARA's "quiet luxury" philosophy.
 * The `.elegant-divider` hairlines are purely decorative (aria-hidden)
 * and defined in index.css so they stay outside the JSX prop explosion.
 */
const BrandStatement = () => (
  <section
    id="story"
    className="py-[120px] bg-background text-center"
    aria-labelledby="brand-philosophy-heading"
  >
    <div className="max-w-3xl mx-auto px-6">
      {/* Top divider */}
      <div className="elegant-divider mb-12 mx-auto" aria-hidden="true" />

      <p className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-primary mb-6">
        Nuestra Filosofía
      </p>

      <h2
        id="brand-philosophy-heading"
        className="font-headline-lg text-headline-lg mb-8 italic"
      >
        Diseñados para destacar
      </h2>

      <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
        Buscamos la perfección en la sutileza. Siluetas estructuradas que cobran vida a
        través de materiales exclusivos y acabados impecables, diseñadas para complementar
        tu identidad sin necesidad de explicaciones.
      </p>

      {/* Bottom divider */}
      <div className="elegant-divider mt-12 mx-auto" aria-hidden="true" />
    </div>
  </section>
);

export default BrandStatement;
