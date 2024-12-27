import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

const Home = () => {
  const navigate = useNavigate();

  // Sample product data - in a real app, this would come from an API
  const products = [
    {
      id: 1,
      name: 'Smartphone X',
      price: 2499000,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPo7Jczg2qPKpzUq3B7D1VDs2utJQAn4Hccg&s',
      description: 'Latest model with advanced features',
      rating: 4.5,
      sold: 150
    },
    {
      id: 2,
      name: 'Laptop Pro',
      price: 12999000,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPo7Jczg2qPKpzUq3B7D1VDs2utJQAn4Hccg&s',
      description: 'High-performance laptop for professionals',
      rating: 4.8,
      sold: 75
    },
    {
      id: 3,
      name: 'Smart Watch',
      price: 1899000,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPo7Jczg2qPKpzUq3B7D1VDs2utJQAn4Hccg&s',
      description: 'Fitness and health tracking features',
      rating: 4.3,
      sold: 200
    },
    {
      id: 4,
      name: 'Wireless Earbuds',
      price: 899000,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPo7Jczg2qPKpzUq3B7D1VDs2utJQAn4Hccg&s',
      description: 'Premium sound quality with noise cancellation',
      rating: 4.6,
      sold: 300
    },
    {
      id: 5,
      name: 'Gaming Console',
      price: 4999000,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPo7Jczg2qPKpzUq3B7D1VDs2utJQAn4Hccg&s',
      description: 'Next-gen gaming experience',
      rating: 4.7,
      sold: 100
    },
    {
      id: 6,
      name: 'Tablet Pro',
      price: 8999000,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPo7Jczg2qPKpzUq3B7D1VDs2utJQAn4Hccg&s',
      description: 'Perfect for creativity and productivity',
      rating: 4.4,
      sold: 120
    },
    {
      id: 7,
      name: 'Tablet Pro',
      price: 8999000,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPo7Jczg2qPKpzUq3B7D1VDs2utJQAn4Hccg&s',
      description: 'Perfect for creativity and productivity',
      rating: 4.4,
      sold: 120
    },
    {
      id: 8,
      name: 'Tablet Pro',
      price: 8999000,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPo7Jczg2qPKpzUq3B7D1VDs2utJQAn4Hccg&s',
      description: 'Perfect for creativity and productivity',
      rating: 4.4,
      sold: 120
    }
  ];

  const handleProductClick = (product) => {
    navigate('/payment', { 
      state: { 
        product: {
          ...product,
          quantity: 1
        }
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block">Payment Gateway</span>
          <span className="block text-blue-600">Integration with Midtrans</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl">
          Secure and easy payment processing for your business needs
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onClick={() => handleProductClick(product)}
          >
            {/* Product Image */}
            <div className="aspect-w-1 aspect-h-1">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {product.name}
              </h3>
              
              <p className="mt-1 text-lg font-semibold text-blue-600">
                Rp {product.price.toLocaleString('id-ID')}
              </p>
              
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {product.description}
              </p>

              <div className="mt-2 flex items-center text-sm text-gray-500">
                <span className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="ml-1">{product.rating}</span>
                </span>
                <span className="mx-2">•</span>
                <span>{product.sold} sold</span>
              </div>

              <Button
                variant="primary"
                className="w-full mt-3"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProductClick(product);
                }}
              >
                Buy Now
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Features Section */}
      <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Multiple Payment Methods</h3>
          <p className="mt-2 text-gray-500">
            Support for credit cards, bank transfers, e-wallets, and more.
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Secure Transactions</h3>
          <p className="mt-2 text-gray-500">
            Industry-standard security with encryption and fraud detection.
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Real-time Updates</h3>
          <p className="mt-2 text-gray-500">
            Instant payment notifications and status updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;