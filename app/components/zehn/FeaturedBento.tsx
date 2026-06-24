import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import {ZehnStaticImage} from '~/components/zehn';

interface BentoItem {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  gridClass: string;
}

const bentoItems: BentoItem[] = [
  {
    id: '1',
    title: 'NEUHEITEN',
    description: 'Discover the latest additions',
    image: '/bento-new-arrivals.jpg',
    link: '/collections/neuheiten',
    gridClass: 'col-span-1 row-span-8', // Salmon - full height left
  },
  {
    id: '2',
    title: 'Premium',
    description: 'Quality craftsmanship',
    image: '/bento-premium.jpg',
    link: '/pages/about',
    gridClass: 'col-span-1 row-span-3', // Broccoli - top middle-left
  },
  {
    id: '3',
    title: 'Style Guide',
    description: 'Find your perfect look',
    image: '/bento-style-guide.jpg',
    link: '/pages/fitguide',
    gridClass: 'col-span-2 row-span-3', // Tamago - wide top right
  },
  {
    id: '4',
    title: 'Sale',
    description: 'Up to 50% off',
    image: '/bento-sale.jpg',
    link: '/collections/sale',
    gridClass: 'col-span-1 row-span-5', // Pork - tall bottom middle-left
  },
  {
    id: '5',
    title: 'Bestsellers',
    description: 'Customer favorites',
    image: '/bento-bestsellers.jpg',
    link: '/collections/bestseller',
    gridClass: 'col-span-1 row-span-5', // Edamame - tall bottom middle-right
  },
  {
    id: '6',
    title: 'Collections',
    description: 'Explore all styles',
    image: '/bento-collections.jpg',
    link: '/collections/all',
    gridClass: 'col-span-1 row-span-5', // Tomato - tall bottom right
  },
];

export function FeaturedBento() {
  return (
    <section className="w-full flex items-center justify-center py-3 bg-background">
      <div className="w-full h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-3 sm:mb-10 lg:mb-14">
          <span className="font-sans text-xs sm:text-sm tracking-[0.3em] uppercase text-muted mb-3 sm:mb-4 block">
            HIGHLIGHTS
          </span>
          <h2 className="font-sans text-h2 sm:text-h2-sm lg:text-h2-lg text-foreground mb-3 sm:mb-4 text-balance">
            Entdecke die Welt von ZEHN
          </h2>
        </div>

        {/* Bento Grid - 4x8 layout with min-h-screen */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 grid-rows-4 md:grid-rows-8 lg:grid-rows-8 gap-4 h-[400px] md:h-[400px] lg:h-[400px]">
          {bentoItems.map((item, index) => (
            <Link
              key={item.id}
              to={item.link}
              className={`group relative overflow-hidden rounded-2xl ${
                // Mobile: Show only first 4 items in 2x2 grid
                index >= 4 ? 'hidden md:block' : ''
              } ${
                // Mobile 2x2, Tablet & Desktop 4x8
                index === 0 ? 'col-span-1 row-span-2 md:col-span-1 md:row-span-8 lg:col-span-1 lg:row-span-8' :
                index === 1 ? 'col-span-1 row-span-2 md:col-span-1 md:row-span-3 lg:col-span-1 lg:row-span-3' :
                index === 2 ? 'col-span-2 row-span-2 md:col-span-2 md:row-span-3 lg:col-span-2 lg:row-span-3' :
                index === 3 ? 'col-span-2 row-span-2 md:col-span-1 md:row-span-5 lg:col-span-1 lg:row-span-5' :
                item.gridClass
              }`}
            >
              {/* ZehnStaticImage: skeleton+fade inside Link's relative overflow-hidden bento cell */}
              <ZehnStaticImage
                src={item.image}
                alt={item.title}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
