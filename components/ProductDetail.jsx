import { useState } from 'react';

const ProductDetail = ({ product, onBack, onAddToCart, onGoToCheckout }) => {
  const [addedFeedback, setAddedFeedback] = useState(false);
  const numericPrice = Number(product.price.replace(/[^0-9]/g, ''));
  const cartItem = { id: product.id, name: product.name, price: numericPrice, imageUrl: product.imageUrl };

  const handleAddToCart = () => {
    onAddToCart(cartItem);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  };

  const handleBuy = () => {
    onAddToCart(cartItem);
    onGoToCheckout();
  };

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

            <p className="font-body-md text-on-surface-variant mb-10 leading-relaxed">
              Pieza artesanal de la colección MARA. Confeccionada con los mejores
              materiales y un acabado impecable que define el lujo silencioso.
              Cada pieza es única, cuidadosamente elaborada por artesanos
              mexicanos con técnicas tradicionales transmitidas por generaciones.
            </p>

            <div className="flex gap-4">
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
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetail;
