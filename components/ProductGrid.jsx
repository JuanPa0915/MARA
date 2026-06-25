import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { supabase } from '../src/lib/supabaseClient';

const ProductGrid = ({ searchQuery = '', onViewProduct }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: supabaseError } = await supabase
          .from('productos')
          .select('*');

        if (cancelled) return;

        if (supabaseError) {
          setError(supabaseError.message);
          setLoading(false);
          return;
        }

        console.log("Productos de Supabase:", data);

        const mapped = (data ?? []).map((item) => ({
          id: item.id,
          name: item.nombre,
          modelo: item.modelo,
          color: item.color,
          price: Number(item.precio).toLocaleString('es-CO'),
          stock: item.stock,
          descripcion: item.descripcion,
          detalles: item.detalles,
          imageUrl: item.imagen_url,
          alt: `${item.nombre} — ${item.modelo}`,
        }));

        setProducts(mapped);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Error de conexión con la base de datos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <section
        id="collection"
        className="max-w-[1440px] mx-auto px-5 md:px-[80px] pt-[60px] pb-[120px] scroll-mt-20"
      >
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        id="collection"
        className="max-w-[1440px] mx-auto px-5 md:px-[80px] pt-[60px] pb-[120px] scroll-mt-20"
      >
        <p className="text-center font-body-md text-error">
          {error}
        </p>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section id="collection" className="max-w-[1440px] mx-auto px-5 md:px-[80px] pt-[60px] pb-[120px] scroll-mt-20">
        <p className="text-center font-body-md text-neutral-500">La base de datos está conectada pero la tabla 'productos' no tiene registros.</p>
      </section>
    );
  }

  if (filtered.length === 0) {
    return (
      <section id="collection" className="max-w-[1440px] mx-auto px-5 md:px-[80px] pt-[60px] pb-[120px] scroll-mt-20">
        <p className="text-center font-body-md text-neutral-500">No hay productos que coincidan con la búsqueda: "{searchQuery}"</p>
      </section>
    );
  }

  return (
    <section
      id="collection"
      className="max-w-[1440px] mx-auto px-5 md:px-[80px] pt-[60px] pb-[120px] scroll-mt-20"
      aria-labelledby="collection-heading"
    >
      <h2 id="collection-heading" className="sr-only">
        Colección MARA — {filtered.length} {filtered.length === 1 ? 'pieza' : 'piezas'} icónica{filtered.length !== 1 ? 's' : ''}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-20 gap-x-6">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            name={product.name}
            price={product.price}
            imageUrl={product.imageUrl}
            alt={product.alt}
            onClick={() => onViewProduct(product)}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductGrid;
