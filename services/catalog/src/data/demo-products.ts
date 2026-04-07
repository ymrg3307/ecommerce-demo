export type CatalogProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  tags: string[];
  clothType: string;
  color: string;
  material: string;
  fit: string;
  brand: string;
};

export const demoProducts: CatalogProduct[] = [
  {
    id: 'prod-overshirt-001',
    name: 'Stone Utility Overshirt',
    category: 'Men / Casual Shirts',
    price: 59,
    description:
      'A lightweight overshirt designed for quick demo browsing, with structured pockets and a relaxed everyday fit.',
    image:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    tags: ['shirt', 'men', 'utility', 'casual'],
    clothType: 'Overshirt',
    color: 'Stone Beige',
    material: 'Cotton twill',
    fit: 'Relaxed fit',
    brand: 'CTT Studio'
  },
  {
    id: 'prod-dress-002',
    name: 'Rust Pleated Midi Dress',
    category: 'Women / Dresses & Jumpsuits',
    price: 74,
    description:
      'A soft pleated midi dress with a flattering waistline that works well for the catalog and product demo.',
    image:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
    tags: ['dress', 'women', 'midi', 'sale'],
    clothType: 'Midi dress',
    color: 'Rust Orange',
    material: 'Poly-blend crepe',
    fit: 'Tailored fit',
    brand: 'CTT Edit'
  },
  {
    id: 'prod-jacket-003',
    name: 'Graphite Tech Bomber Jacket',
    category: 'Men / Jackets',
    price: 99,
    description:
      'A clean bomber jacket with contrast lining and simple detailing for a premium product-details presentation.',
    image:
      'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=800&q=80',
    tags: ['jacket', 'men', 'outerwear', 'featured'],
    clothType: 'Bomber jacket',
    color: 'Graphite Grey',
    material: 'Technical nylon',
    fit: 'Regular fit',
    brand: 'CTT Motion'
  },
  {
    id: 'prod-kurta-004',
    name: 'Indigo Embroidered Kurta Set',
    category: 'Women / Kurtas & Suits',
    price: 68,
    description:
      'An embroidered kurta set created to cover the women category from the SRS while staying compact for the final demo.',
    image:
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',
    tags: ['kurta', 'women', 'ethnic', 'festival'],
    clothType: 'Kurta set',
    color: 'Indigo Blue',
    material: 'Cotton blend',
    fit: 'Comfort fit',
    brand: 'CTT Heritage'
  }
];
