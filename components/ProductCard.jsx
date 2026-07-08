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
 * @param {number} stock     – Current stock count (0 = out of stock)
 * @param {function} onClick – Optional click handler (ready for routing)
 *
 * Design decisions
 * ────────────────
 * • The `.product-card-overlay` opacity animation lives in index.css (not
 *   Tailwind's group-hover) to keep the 0.4s ease timing out of JSX noise.
 * • `aspect-[4/5]` preserves portrait proportions on every grid column width.
 * • `loading="lazy"` on the image defers off-screen network requests.
 */
const ProductCard = ({ name, price, imageUrl, alt, stock, onClick }) => {
  const isAgotado = Number(stock) === 0;

  return (
    <div
      className={`relative group bg-white border border-neutral-100 overflow-hidden transition-all duration-300 ${
        isAgotado
          ? "opacity-60 saturate-0 pointer-events-none"
          : "hover:shadow-lg cursor-pointer"
      }`}
      onClick={isAgotado ? undefined : onClick}
      onKeyDown={(e) => !isAgotado && e.key === 'Enter' && onClick?.()}
      role="button"
      tabIndex={isAgotado ? -1 : 0}
      aria-label={isAgotado ? `${name} — ${price} — Vendido` : `Ver detalles de ${name} — ${price}`}
    >
      {/* BADGE DE VENDIDO */}
      {isAgotado && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/5 pointer-events-none">
          <span className="bg-white/90 text-black text-xs font-bold tracking-widest uppercase px-4 py-2 border border-black shadow-xl transform -rotate-12 backdrop-blur-sm">
            Vendido
          </span>
        </div>
      )}

      {/* IMAGEN */}
      <div className="relative overflow-hidden aspect-[4/5]">
        <img
          src={imageUrl}
          alt={alt}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-700 ${
            isAgotado ? "" : "group-hover:scale-105"
          }`}
        />
      </div>

      {/* INFO */}
      <div className="p-4 text-center">
        <h3 className="font-label-lg text-label-lg uppercase mb-2">{name}</h3>
        <p className="font-body-md text-on-surface-variant">{price}</p>

        <button
          disabled={isAgotado}
          tabIndex={isAgotado ? -1 : 0}
          className={`w-full mt-4 py-2 text-xs font-medium tracking-wider uppercase transition-colors ${
            isAgotado
              ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              : "bg-primary text-white hover:bg-neutral-800"
          }`}
        >
          {isAgotado ? "Agotado" : "Ver Detalles"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
