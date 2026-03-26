import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProduct, Product } from '../lib/api';

export function ProductDetailsPage() {
  const { id = '' } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('Loading product...');

  useEffect(() => {
    let active = true;

    void getProduct(id)
      .then((item) => {
        if (!active) {
          return;
        }

        setProduct(item);
        setMessage('');
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setMessage(error instanceof Error ? error.message : 'Unable to load product.');
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (!product) {
    return <div className="panel">{message}</div>;
  }

  const outOfStock = product.inventory?.status === 'OUT_OF_STOCK';

  return (
    <section className="detail-layout">
      <div className="detail-visual">
        <img alt={product.name} src={product.image} />
      </div>
      <div className="detail-copy">
        <Link className="secondary-link" to="/search">
          Back to catalog
        </Link>
        <span className="category-pill">{product.category}</span>
        <h1>{product.name}</h1>
        <p className="detail-price">${product.price}</p>
        <p>{product.description}</p>
        <div className="detail-tags">
          {product.tags.map((tag) => (
            <span className="tag-chip" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <div className="stock-panel">
          <span className={outOfStock ? 'stock-bad' : 'stock-good'}>
            {outOfStock ? 'Out of Stock' : `In Stock • ${product.inventory?.stockCount ?? 0} left`}
          </span>
          <label className="quantity-row">
            Quantity
            <input
              min={1}
              max={Math.max(product.inventory?.stockCount ?? 1, 1)}
              onChange={(event) => setQuantity(Number(event.target.value))}
              type="number"
              value={quantity}
            />
          </label>
          <button className="primary-button" disabled={outOfStock}>
            {outOfStock ? 'Unavailable' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </section>
  );
}
