import { useState } from 'react';
import Header from '../components/Header'
import Hero from '../components/Hero'
import ProductGrid from '../components/ProductGrid'
import ProductDetail from '../components/ProductDetail'
import BrandStatement from '../components/BrandStatement'
import Newsletter from '../components/Newsletter'
import Footer from '../components/Footer'
import Checkout from '../components/Checkout'
import { supabase } from './lib/supabaseClient'
import { generateReference, generateSignature, openWompiWidget } from './lib/wompi'
import './App.css'

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [processing, setProcessing] = useState(false);

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

  const goToStore = () => {
    setSelectedProduct(null);
    setShowCheckout(false);
  };

  const goToCheckout = () => {
    setSelectedProduct(null);
    setShowCheckout(true);
    window.scrollTo(0, 0);
  };

  const closeCheckout = () => {
    setShowCheckout(false);
  };

  const handleCheckoutSubmit = async (formData) => {
    try {
      setProcessing(true);

      const amountInCents = Math.round(total * 100);
      const reference = generateReference();
      const signature = await generateSignature(reference, amountInCents);
      const redirectUrl = window.location.origin + window.location.pathname;

      const rows = cartItems.map((item) => ({
        nombre_completo: formData.nombre || formData.nombre_completo,
        celular_telefono: formData.celular || formData.celular_telefono,
        correo_electronico: formData.email || formData.correo_electronico,
        direccion_completa: formData.direccion || formData.direccion_completa,
        apartamento_torre_oficina: formData.apartamento || formData.apartamento_torre_oficina,
        barrio: formData.barrio,
        ciudad_municipio: formData.ciudad || formData.ciudad_municipio,
        departamento: formData.departamento,
        codigo_postal: formData.codigoPostal || formData.codigo_postal,
        indicaciones_adicionales: formData.indicaciones || formData.indicaciones_adicionales,
        tipo_documento: formData.tipoDocumento || formData.tipo_documento,
        numero_documento: formData.documento || formData.numero_documento,
        producto_id: item.id,
        total_pagado: total,
        referencia_wompi: reference,
        estado_pago: 'pendiente',
      }));

      const { error: insertError } = await supabase.from('pedidos').insert(rows);
      if (insertError) throw insertError;

      const transaction = await openWompiWidget({
        amountInCents,
        reference,
        signature,
        customerData: {
          email: formData.email,
          nombre: formData.nombre,
          celular: formData.celular,
        },
        redirectUrl,
      });

      if (transaction.status === 'APPROVED') {
        const { error: updateError } = await supabase
          .from('pedidos')
          .update({ estado_pago: 'pagado', transaccion_id: transaction.id })
          .eq('referencia_wompi', reference);

        if (updateError) throw updateError;

        alert(`¡Pedido confirmado, ${formData.nombre}! Te enviaremos la guía de rastreo a ${formData.email}.`);
        setCartItems([]);
        setShowCheckout(false);
      } else {
        await supabase
          .from('pedidos')
          .update({ estado_pago: 'rechazado' })
          .eq('referencia_wompi', reference);

        alert('El pago no fue aprobado. Puedes intentar de nuevo cuando quieras — tus datos y productos siguen guardados.');
      }
    } catch (error) {
      console.error('❌ ERROR DETALLADO EN EL FLUJO DE PAGO:', error);
      if (error && typeof error === 'object') {
        console.log('Propiedades del error:', Object.getOwnPropertyNames(error).reduce((acc, key) => {
          acc[key] = error[key];
          return acc;
        }, {}));
      }
      alert('Ocurrió un error inesperado. Por favor intenta de nuevo.');
    } finally {
      setProcessing(false);
    }
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
        onGoToStore={goToStore}
        onGoToCheckout={goToCheckout}
      />
      {showCheckout ? (
        <Checkout
          cartItems={cartItems}
          total={total}
          processing={processing}
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
