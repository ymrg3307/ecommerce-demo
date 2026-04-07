import { FormEvent, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Product, searchProducts } from '../lib/api';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('keyword') ?? '');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Search the product catalog by keyword.');

  useEffect(() => {
    const current = searchParams.get('keyword');
    if (!current) {
      return;
    }

    void runSearch(current);
  }, [searchParams]);

  async function runSearch(term: string) {
    setLoading(true);
    const items = await searchProducts(term);
    setResults(items);
    setMessage(items.length ? `${items.length} result(s) for "${term}"` : `No products found for "${term}".`);
    setLoading(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setMessage('Enter a search term before submitting.');
      return;
    }

    setSearchParams({ keyword: trimmed });
    await runSearch(trimmed);
  }

  return (
    <section className="stack">
      <div className="hero-strip">
        <span className="eyebrow">SRS flow: Search</span>
        <h1>Find products by keyword and move into a detailed product page.</h1>
        <p>
          This page intentionally keeps the demo path tight: search, inspect stock, and open a product in one
          step.
        </p>
      </div>

      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          aria-label="Search products"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try shirt, dress, kurta, jacket"
        />
        <button className="primary-button" type="submit">
          Search
        </button>
      </form>

      <p className="status-line">{loading ? 'Loading search results...' : message}</p>

      <div className="product-grid">
        {results.map((product) => (
          <article className="product-card" key={product.id}>
            <img alt={product.name} src={product.image} />
            <div className="product-card-body">
              <div className="product-meta">
                <span className="category-pill">{product.category}</span>
                <h2>{product.name}</h2>
                <p>{product.description}</p>
              </div>
              <div>
                <div className="product-footer">
                  <strong>${product.price}</strong>
                </div>
                <Link
                  className="secondary-link"
                  to={`/products/${product.id}`}
                  state={{ backTo: `/search${searchParams.toString() ? `?${searchParams.toString()}` : ''}` }}
                >
                  View product details
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
