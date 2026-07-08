const ProductCard = ({ name, price, imageUrl, alt, onClick }) => (
  <article
    className="product-card cursor-pointer group"
    onClick={onClick}
    onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    role="button"
    tabIndex={0}
    aria-label={`Ver detalles de ${name} — ${price}`}
  >
    <div className="aspect-[4/5] bg-secondary-fixed mb-6 relative overflow-hidden">
      <img
        src={imageUrl}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />

      <div
        className="product-card-overlay absolute inset-0 bg-primary/5 flex items-end justify-center pb-6"
        aria-hidden="true"
      >
        <span className="font-label-lg text-label-lg uppercase tracking-widest bg-white/90 px-6 py-3">
          Ver Detalles
        </span>
      </div>
    </div>

    <div className="text-center">
      <h3 className="font-label-lg text-label-lg uppercase mb-2">{name}</h3>
      <p className="font-body-md text-on-surface-variant">{price}</p>
    </div>
  </article>
);

export default ProductCard;
