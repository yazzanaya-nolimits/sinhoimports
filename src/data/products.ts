export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'perfume' | 'relogio' | 'multimidia' | 'som';
  buyPrice: number;
  sellPrice: number;
  stock: number;
  image: string;
  description: string;
  featured?: boolean;
}

export const BRANDS = [
  'Lattafa', 'Al Haramain', 'Armaf', 'Swiss Arabian', 'Rasasi',
  'Rolex', 'Bulgari', 'Invicta', 'Tissot', 'Casio',
  'Pioneer', 'Multimídia', 'JBL', 'Bose'
];

export const CATEGORIES = {
  perfume: 'Perfumes',
  relogio: 'Relógios',
  multimidia: 'Multimídia Automotiva',
  som: 'Som',
};

export const mockProducts: Product[] = [
  {
    id: '1', name: 'Raghba', brand: 'Lattafa', category: 'perfume',
    buyPrice: 80, sellPrice: 189.90, stock: 25,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400',
    description: 'Perfume árabe amadeirado com notas de baunilha e oud. Fixação excepcional.',
    featured: true,
  },
  {
    id: '2', name: 'Amber Oud Gold', brand: 'Al Haramain', category: 'perfume',
    buyPrice: 120, sellPrice: 279.90, stock: 15,
    image: 'https://images.unsplash.com/photo-1594035910387-fea081acb59c?w=400',
    description: 'Luxuoso perfume com oud autêntico, âmbar e notas florais orientais.',
    featured: true,
  },
  {
    id: '3', name: 'Club de Nuit Intense', brand: 'Armaf', category: 'perfume',
    buyPrice: 90, sellPrice: 219.90, stock: 30,
    image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400',
    description: 'Inspiração sofisticada com notas cítricas, florais e amadeiradas.',
    featured: true,
  },
  {
    id: '4', name: 'Submariner Date', brand: 'Rolex', category: 'relogio',
    buyPrice: 8500, sellPrice: 14999.90, stock: 3,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400',
    description: 'Relógio icônico de mergulho em aço inoxidável com bisel cerâmico.',
    featured: true,
  },
  {
    id: '5', name: 'Serpenti Seduttori', brand: 'Bulgari', category: 'relogio',
    buyPrice: 6000, sellPrice: 11499.90, stock: 2,
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400',
    description: 'Elegância italiana com design serpente em ouro rosa e diamantes.',
    featured: true,
  },
  {
    id: '6', name: 'Pro Diver', brand: 'Invicta', category: 'relogio',
    buyPrice: 400, sellPrice: 899.90, stock: 12,
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400',
    description: 'Relógio automático de mergulho com mostrador azul e pulseira de aço.',
  },
  {
    id: '7', name: 'Central Multimídia 9"', brand: 'Pioneer', category: 'multimidia',
    buyPrice: 800, sellPrice: 1499.90, stock: 8,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400',
    description: 'Central multimídia com tela 9" touchscreen, Android Auto e Apple CarPlay.',
  },
  {
    id: '8', name: 'Subwoofer 12"', brand: 'JBL', category: 'som',
    buyPrice: 350, sellPrice: 699.90, stock: 10,
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400',
    description: 'Subwoofer de alta potência 500W RMS para som automotivo.',
  },
  {
    id: '9', name: 'Shaghaf Oud', brand: 'Swiss Arabian', category: 'perfume',
    buyPrice: 95, sellPrice: 229.90, stock: 18,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400',
    description: 'Fragrância unissex com oud, rosa e almíscar. Longa duração.',
  },
  {
    id: '10', name: 'Daarej', brand: 'Rasasi', category: 'perfume',
    buyPrice: 70, sellPrice: 169.90, stock: 22,
    image: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=400',
    description: 'Perfume árabe floral fresco com notas de frutas e madeira.',
  },
];

export const WHATSAPP_NUMBER = '5511970677627';
export const INSTAGRAM_URL = 'https://www.instagram.com/sinhoimports/';

export function getWhatsAppLink(productName?: string) {
  const message = productName
    ? `Olá! Tenho interesse no produto: ${productName}. Poderia me dar mais informações?`
    : 'Olá! Gostaria de saber mais sobre os produtos da Sinho Imports.';
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
