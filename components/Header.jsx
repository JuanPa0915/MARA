import { useState, useEffect, useRef } from 'react';
import { calculateCartTotal, sanitizeText } from '../src/lib/security';

const Header = ({ cartCount, cartItems, onRemoveFromCart, onClearCart, searchQuery, onSearchChange, onGoToStore, onGoToCheckout }) => {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const closeOnEscape = (e) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setCartOpen(false);
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  const total = calculateCartTotal(cartItems);

  return (
    <header
      className={`sticky top-0 w-full z-50 bg-background/95 backdrop-blur-sm
                  transition-shadow duration-300 ${scrolled ? 'shadow-sm' : ''}`}
    >
      <nav
        className="flex justify-between items-center w-full h-20
                   px-5 md:px-[80px] max-w-[1440px] mx-auto relative"
        aria-label="Navegación principal"
      >
        <div className="hidden sm:flex gap-8">
          <button
            onClick={() => { onGoToStore(); document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="nav-link-active"
          >
            Tienda
          </button>
        </div>

        <a
          href="/"
          className="font-headline-lg text-headline-lg text-primary uppercase tracking-tighter"
          aria-label="MARA — ir al inicio"
        >
          MARA
        </a>

        <div className="flex items-center gap-4 md:gap-6 relative">
          <button
            aria-label="Buscar"
            onClick={() => { setSearchOpen(!searchOpen); }}
            className="hover:opacity-70 transition-opacity duration-300"
          >
            <span className="material-symbols-outlined" aria-hidden="true">search</span>
          </button>

          <button
            aria-label={`Carrito de compras — ${cartCount} artículo${cartCount !== 1 ? 's' : ''}`}
            onClick={() => { setCartOpen(!cartOpen); setSearchOpen(false); }}
            className="hover:opacity-70 transition-opacity duration-300 relative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 text-[10px] bg-primary text-white
                           w-4 h-4 rounded-full flex items-center justify-center"
                aria-hidden="true"
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className={`search-bar ${searchOpen ? 'open' : ''}`}>
        <div className="max-w-[1440px] mx-auto flex items-center gap-4">
          <span className="material-symbols-outlined text-on-surface-variant" aria-hidden="true">search</span>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(sanitizeText(e.target.value, 80))}
            placeholder="Buscar productos…"
            className="flex-1 bg-transparent border-none outline-none font-body-md text-on-surface placeholder:text-on-surface-variant/40"
          />
          <button
            onClick={() => { setSearchOpen(false); onSearchChange(''); }}
            className="font-label-sm text-label-sm uppercase tracking-widest text-primary hover:opacity-70 transition-opacity"
          >
            Cerrar
          </button>
        </div>
      </div>

      <div className={`cart-backdrop ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)} />

      <div className={`cart-panel ${cartOpen ? 'open' : ''}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100">
            <h2 className="font-headline-md text-headline-md uppercase">Tu Bolsa</h2>
            <button
              onClick={() => setCartOpen(false)}
              className="hover:opacity-70 transition-opacity"
              aria-label="Cerrar bolsa"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            {cartItems.length === 0 ? (
              <p className="font-body-md text-on-surface-variant text-center mt-20">
                Tu bolsa está vacía.
              </p>
            ) : (
              <ul className="space-y-6">
                {cartItems.map((item, index) => (
                  <li key={index} className="flex gap-4 pb-6 border-b border-gray-100">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-24 object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-label-lg text-label-lg uppercase mb-1">{item.name}</h3>
                      <p className="font-body-md text-on-surface-variant">{item.price.toLocaleString('es-CO')}</p>
                      <button
                        onClick={() => onRemoveFromCart(index)}
                        className="font-label-sm text-label-sm uppercase tracking-widest text-error/70 hover:text-error mt-2 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="px-6 py-6 border-t border-gray-100">
            <div className="flex justify-between mb-4">
              <span className="font-label-lg text-label-lg uppercase">Total</span>
              <span className="font-headline-md text-headline-md">{total.toLocaleString('es-CO')}</span>
            </div>
            <button
              className="btn-primary w-full text-center block"
              onClick={() => { setCartOpen(false); onGoToCheckout(); }}
            >
              Pagar
            </button>
            {cartItems.length > 0 && (
              <button
                onClick={onClearCart}
                className="w-full text-center mt-3 font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant hover:text-error transition-colors"
              >
                Vaciar Bolsa
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
