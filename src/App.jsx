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
import { showSuccess, showError } from './lib/swal'
import {
  calculateCartTotal,
  normalizeCartItem,
  validateCartForCheckout,
  validateCheckoutForm,
} from './lib/security'
import './App.css'

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [processing, setProcessing] = useState(false);

  const addToCart = (product) => {
    try {
      setCartItems((prev) => [...prev, normalizeCartItem(product)]);
    } catch (err) {
      showError('Producto invalido', err.message || 'No pudimos agregar este producto.');
    }
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

      const sanitizedForm = validateCheckoutForm(formData);
      const { verifiedItems, verifiedTotal, amountInCents } = await validateCartForCheckout(cartItems, supabase);

      if (calculateCartTotal(cartItems) !== verifiedTotal) {
        throw new Error('El total del carrito no coincide con el catalogo actual.');
      }

      const reference = generateReference();
      const signature = await generateSignature(reference, amountInCents, verifiedItems);
      const redirectUrl = window.location.origin + window.location.pathname;

      const rows = verifiedItems.map((item) => ({
        nombre_completo: sanitizedForm.nombre,
        celular_telefono: sanitizedForm.celular,
        correo_electronico: sanitizedForm.email,
        direccion_completa: sanitizedForm.direccion,
        apartamento_torre_oficina: sanitizedForm.apartamento,
        barrio: sanitizedForm.barrio,
        ciudad_municipio: sanitizedForm.ciudad,
        departamento: sanitizedForm.departamento,
        codigo_postal: sanitizedForm.codigoPostal,
        indicaciones_adicionales: sanitizedForm.indicaciones,
        tipo_documento: sanitizedForm.tipoDocumento,
        numero_documento: sanitizedForm.documento,
        producto_id: item.id,
        total_pagado: verifiedTotal,
        referencia_wompi: reference,
        estado_pago: 'pendiente',
      }));

      const { error: insertError } = await supabase.from('pedidos').insert(rows);
      if (insertError) throw insertError;

      let transaction
      try {
        transaction = await openWompiWidget({
          amountInCents,
          reference,
          signature,
          customerData: {
            email: sanitizedForm.email,
            fullName: sanitizedForm.nombre,
            phoneNumber: sanitizedForm.celular.replace(/[^\d]/g, ''),
            phoneNumberPrefix: '+57',
            legalIdType: sanitizedForm.tipoDocumento,
            legalId: sanitizedForm.documento,
          },
          redirectUrl,
        })
      } catch (widgetError) {
        console.error('[Checkout Debug] Error crítico al abrir Wompi:', widgetError)
        alert(`Error al abrir la pasarela de pago:\n\n${widgetError.message}\n\nRevisa la consola para más detalles.`)
        throw widgetError
      }

      if (transaction.status === 'APPROVED') {
        showSuccess('Pedido confirmado', `${sanitizedForm.nombre}, tu pedido ha sido confirmado. Te enviaremos la guia de rastreo a ${sanitizedForm.email}.`);
        setCartItems([]);
        setShowCheckout(false);
      } else if (transaction.status === 'CANCELLED') {
        console.log('[Checkout] Usuario cerró el widget sin completar el pago.')
      } else {
        showError('Pago no aprobado', 'El pago no fue aprobado. Puedes intentar de nuevo cuando quieras.');
      }
    } catch (error) {
      console.error('[Checkout Debug] Error crítico:', error);
      alert(`Error en el proceso de pago:\n\n${error.message}\n\nRevisa la consola para más detalles.`);
      showError('No pudimos procesar el pedido', error.message || 'Ocurrio un error inesperado. Por favor intenta de nuevo.');
    } finally {
      setProcessing(false);
    }
  };

  const total = calculateCartTotal(cartItems);

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
