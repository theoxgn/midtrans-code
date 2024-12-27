const Footer = () => {
    return (
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                About Us
              </h3>
              <p className="mt-4 text-base text-gray-500">
                Secure payment processing solution integrated with Midtrans payment gateway.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Payment Methods
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <span className="text-base text-gray-500">Credit Card</span>
                </li>
                <li>
                  <span className="text-base text-gray-500">Bank Transfer</span>
                </li>
                <li>
                  <span className="text-base text-gray-500">E-Wallet</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Contact Us
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="mailto:support@example.com" className="text-base text-gray-500 hover:text-gray-900">
                    support@example.com
                  </a>
                </li>
                <li>
                  <span className="text-base text-gray-500">+62 123 456 789</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8">
            <p className="text-base text-gray-400 text-center">
              © {new Date().getFullYear()} Payment Gateway. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;