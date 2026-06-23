import ProductCard from './ProductCard';
import { productsData } from '../src/productsData';

const ProductGrid = ({ searchQuery, onViewProduct }) => {
  const filtered = productsData.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
