import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentMethodSelection from './PaymentMethodSelection';

const PaymentForm = ({ onSubmit, isLoading, product }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1); // 1: Customer Details, 2: Payment Method, 3: Summary
  const [customerDetails, setCustomerDetails] = useState({
    first_name: 'jjj',
    last_name: 'asdad',
    email: 'asda@gmail.com',
    phone: '098127836'
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
    setCurrentStep(3); // Move to summary after selecting payment method
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (!selectedPaymentMethod) return;

    const payload = {
      payment_type: selectedPaymentMethod.payment_type,
      transaction_details: {
        order_id: `ORDER-${Date.now()}`,
        gross_amount: product.price
      },
      item_details: [{
        id: product.id,
        price: product.price,
        quantity: 1,
        name: product.name
      }],
      customer_details: customerDetails,
      ...selectedPaymentMethod
    };

    onSubmit(payload);
  };

  const handleNextToPayment = () => {
    if (!customerDetails.first_name || !customerDetails.last_name || 
        !customerDetails.email || !customerDetails.phone) {
      alert('Please fill in all customer details');
      return;
    }
    setCurrentStep(2);
  };

  // Redirect if no product
  if (!product) {
    navigate('/');
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div className={`flex-1 text-center ${currentStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
            1. Customer Details
          </div>
          <div className={`flex-1 text-center ${currentStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
            2. Payment Method
          </div>
          <div className={`flex-1 text-center ${currentStep >= 3 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
            3. Order Summary
          </div>
        </div>
        <div className="mt-2 flex">
          <div className={`h-2 flex-1 ${currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`h-2 flex-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`h-2 flex-1 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        </div>
      </div>

      {/* Order Details - Always visible */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>
        <div className="border rounded-lg p-4">
          <div className="flex items-start space-x-4">
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
              {product.description && (
                <p className="text-gray-500 mt-1">{product.description}</p>
              )}
              <div className="mt-2">
                <span className="text-lg font-semibold text-blue-600">
                  Rp {product.price.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Quantity: 1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Details */}
      {currentStep === 1 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={customerDetails.first_name}
                onChange={(e) => setCustomerDetails(prev => ({
                  ...prev,
                  first_name: e.target.value
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={customerDetails.last_name}
                onChange={(e) => setCustomerDetails(prev => ({
                  ...prev,
                  last_name: e.target.value
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={customerDetails.email}
                onChange={(e) => setCustomerDetails(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={customerDetails.phone}
                onChange={(e) => setCustomerDetails(prev => ({
                  ...prev,
                  phone: e.target.value
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleNextToPayment}
            className="w-full mt-6 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
          >
            Next: Select Payment Method
          </button>
        </div>
      )}

      {/* Payment Method Selection */}
      {currentStep === 2 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Payment Method</h2>
          <PaymentMethodSelection 
            onSelect={handlePaymentMethodSelect}
            isLoading={isLoading}
          />
          <button
            onClick={() => setCurrentStep(1)}
            className="w-full mt-6 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
          >
            Back to Customer Details
          </button>
        </div>
      )}

      {/* Order Summary */}
      {currentStep === 3 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
              <p className="text-gray-600">Name: {customerDetails.first_name} {customerDetails.last_name}</p>
              <p className="text-gray-600">Email: {customerDetails.email}</p>
              <p className="text-gray-600">Phone: {customerDetails.phone}</p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-medium text-gray-900 mb-2">Payment Method</h3>
              <p className="text-gray-600">{selectedPaymentMethod?.payment_type === 'bank_transfer' 
                ? `Bank Transfer (${selectedPaymentMethod.bank_transfer?.bank})` 
                : selectedPaymentMethod?.payment_type}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Amount to Pay</h3>
              <p className="text-xl font-semibold text-blue-600">Rp {product.price.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex space-x-4 mt-6">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              Back to Payment Method
            </button>
            <button
              onClick={handleSubmitOrder}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Complete Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;