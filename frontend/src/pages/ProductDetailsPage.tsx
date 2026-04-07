import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getProduct, Product } from '../lib/api';

export function ProductDetailsPage() {
  const { id = '' } = useParams();
  const location = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState('Loading product...');
  const backTo =
    typeof location.state === 'object' &&
    location.state &&
    'backTo' in location.state &&
    typeof location.state.backTo === 'string'
      ? location.state.backTo
      : '/search';

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

  return (
    <section className="detail-layout">
      <div className="detail-visual">
        <img alt={product.name} src={product.image} />
      </div>
      <div className="detail-copy">
        <Link className="secondary-link" to={backTo}>
          Back to catalog
        </Link>
        <span className="category-pill">{product.category}</span>
        <h1>{product.name}</h1>
        <p className="detail-price">${product.price}</p>
        <p>{product.description}</p>
        <div className="spec-grid">
          <div className="spec-card">
            <span>Cloth type</span>
            <strong>{product.clothType}</strong>
          </div>
          <div className="spec-card">
            <span>Color</span>
            <strong>{product.color}</strong>
          </div>
          <div className="spec-card">
            <span>Material</span>
            <strong>{product.material}</strong>
          </div>
          <div className="spec-card">
            <span>Fit</span>
            <strong>{product.fit}</strong>
          </div>
          <div className="spec-card">
            <span>Brand</span>
            <strong>{product.brand}</strong>
          </div>
        </div>
        <div className="detail-tags">
          {product.tags.map((tag) => (
            <span className="tag-chip" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
