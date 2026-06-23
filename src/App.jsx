import { useState } from 'react';
import Header from '../components/Header'
import Hero from '../components/Hero'
import ProductGrid from '../components/ProductGrid'
import ProductDetail from '../components/ProductDetail'
import BrandStatement from '../components/BrandStatement'
import Newsletter from '../components/Newsletter'
import Footer from '../components/Footer'
import Checkout from '../components/Checkout'
import './App.css'

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  const addToCart = (product) => {
    setCartItems((prev) => [...prev, product]);
  };

  const removeFromCart = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const viewProduct = (product) => {
    setSelectedProduct(product);
    setShowCheckout(false);
    window.scrollTo(0, 0);
  };

  const closeProduct = () => {
    setSelectedProduct(null);
  };

  const goToCheckout = () => {
    if (cartItems.length === 0) return;
    setSelectedProduct(null);
    setShowCheckout(true);
    window.scrollTo(0, 0);
  };

  const closeCheckout = () => {
    setShowCheckout(false);
  };

  const handleCheckoutSubmit = (formData) => {
    console.log('Order submitted:', { items: cartItems, shipping: formData });
    alert(`¡Pedido confirmado, ${formData.nombre}! Te enviaremos la guía de rastreo a ${formData.email}.`);
    setCartItems([]);
    setShowCheckout(false);
  };

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <>
      <Header
        cartCount={cartItems.length}
        cartItems={cartItems}
        onRemoveFromCart={removeFromCart}
        onClearCart={clearCart}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onGoToCheckout={goToCheckout}
      />
      {showCheckout ? (
        <Checkout
          cartItems={cartItems}
          total={total}
          onBack={closeCheckout}
          onSubmit={handleCheckoutSubmit}
        />
      ) : selectedProduct ? (
        <ProductDetail
          product={selectedProduct}
          onBack={closeProduct}
          onAddToCart={addToCart}
          onGoToCheckout={goToCheckout}
        />
      ) : (
        <>
          <Hero />
          <ProductGrid searchQuery={searchQuery} onViewProduct={viewProduct} />
          <BrandStatement />
          <Newsletter />
          <Footer />
        </>
      )}
    </>
  )
}

export default App
