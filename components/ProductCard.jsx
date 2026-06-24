/**
 * ProductCard
 * ───────────
 * Atomic, fully self-contained card component.
 *
 * Props
 * ─────
 * @param {string} name      – Product display name (rendered as <h3>)
 * @param {string} price     – Formatted price string e.g. "$2,450"
 * @param {string} imageUrl  – Absolute URL to the product image
 * @param {string} alt       – Descriptive alt text for the image
 * @param {function} onClick – Optional click handler (ready for routing)
 *
 * Design decisions
 * ────────────────
 * • The `.product-card-overlay` opacity animation lives in index.css (not
 *   Tailwind's group-hover) to keep the 0.4s ease timing out of JSX noise.
 * • `aspect-[4/5]` preserves portrait proportions on every grid column width.
 * • `loading="lazy"` on the image defers off-screen network requests.
 */
const ProductCard = ({ name, price, imageUrl, alt, onClick }) => (
  <article
    className="product-card cursor-pointer group"
    onClick={onClick}
    // Allow keyboard activation for accessibility
    onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    role="button"
    tabIndex={0}
    aria-label={`Ver detalles de ${name} — ${price}`}
  >
    {/* ── Image container ── */}
    <div className="aspect-[4/5] bg-secondary-fixed mb-6 relative overflow-hidden">
      <img
        src={imageUrl}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover
                   group-hover:scale-105 transition-transform duration-700"
      />

      {/* ── "View Details" hover overlay ── */}
      {/* aria-hidden: purely visual; the article's aria-label carries the intent */}
      <div
        className="product-card-overlay absolute inset-0 bg-primary/5
                   flex items-end justify-center pb-6"
        aria-hidden="true"
      >
        <span
          className="font-label-lg text-label-lg uppercase tracking-widest
                     bg-white/90 px-6 py-3"
        >
          Ver Detalles
        </span>
      </div>
    </div>

    {/* ── Product info ── */}
    <div className="text-center">
      <h3 className="font-label-lg text-label-lg uppercase mb-2">{name}</h3>
      <p className="font-body-md text-on-surface-variant">{price}</p>
    </div>
  </article>
);

export default ProductCard;
