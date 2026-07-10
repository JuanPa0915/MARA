import { useState } from 'react';
import { normalizeCartItem } from '../src/lib/security';

const ProductDetail = ({ product, onBack, onAddToCart, onGoToCheckout }) => {
  const [addedFeedback, setAddedFeedback] = useState(false);
  const cartItem = normalizeCartItem(product);

  const handleAddToCart = () => {
    onAddToCart(cartItem);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  };

  const handleBuy = () => {
    onAddToCart(cartItem);
    onGoToCheckout();
  };

  const isOutOfStock = Number(product.stock ?? 0) === 0;

  return (
    <main className="min-h-screen pt-[80px]">
      <div className="max-w-[1440px] mx-auto px-5 md:px-[80px] py-[60px]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-label-lg text-label-lg uppercase tracking-widest text-primary hover:opacity-70 transition-opacity mb-12"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Volver
        </button>

        <div className="flex flex-col md:flex-row gap-12 md:gap-20">
          <div className="md:w-[55%]">
            <img
              src={product.imageUrl}
              alt={product.alt}
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="md:w-[45%] flex flex-col justify-center">
            <p className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-primary mb-3">
              MARA
            </p>

            <h1 className="font-headline-lg text-headline-lg uppercase mb-4">
              {product.name}
            </h1>

            <p className="font-display-xl text-display-xl text-primary mb-8">
              {product.price}
            </p>

            {isOutOfStock && (
              <p className="font-label-lg text-label-lg uppercase tracking-widest text-error mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">block</span>
                Producto Agotado
              </p>
            )}

            <p className="font-body-md text-on-surface-variant mb-10 leading-relaxed">
              {product.descripcion}
            </p>

            <div className="flex gap-4">
              {isOutOfStock ? (
                <button
                  disabled
                  className="flex-1 border border-neutral-300 px-8 py-3 font-label-lg text-label-lg uppercase tracking-widest text-neutral-400 cursor-not-allowed text-center"
                >
                  Agotado
                </button>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 border border-primary/40 px-8 py-3 font-label-lg text-label-lg uppercase tracking-widest transition-all duration-500 ease-in-out hover:border-primary text-center"
                  >
                    {addedFeedback ? '✓ Agregado' : 'Agregar al carrito'}
                  </button>
                  <button
                    onClick={handleBuy}
                    className="flex-1 btn-primary text-center"
                  >
                    Comprar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetail;
