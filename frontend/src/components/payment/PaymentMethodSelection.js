import React, { useState } from 'react';
import { CreditCard, Building2, Wallet } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import LoadingSpinner from '../ui/LoadingSpinner';
import paymentService from '../../services/paymentService';

// Credit Card Form Component
const CreditCardForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    card_number: '',
    card_exp_month: '',
    card_exp_year: '',
    card_cvv: '',
    save_card: false
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateCard = () => {
    if (!formData.card_number || formData.card_number.length < 12) {
      throw new Error('Please enter a valid card number');
    }
    if (!formData.card_exp_month || !formData.card_exp_year) {
      throw new Error('Please enter valid expiry date');
    }
    if (!formData.card_cvv || formData.card_cvv.length < 3) {
      throw new Error('Please enter valid CVV');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      validateCard();

      // Get card token from Midtrans
      const tokenResponse = await paymentService.getCardToken({
        card_number: formData.card_number.replace(/\s/g, ''),
        card_exp_month: formData.card_exp_month,
        card_exp_year: formData.card_exp_year,
        card_cvv: formData.card_cvv
      });
      
      if (!tokenResponse?.token_id) {
        throw new Error('Failed to generate card token');
      }

      // Submit the payment data with token
      onSubmit({
        payment_type: 'credit_card',
        credit_card: {
          token_id: tokenResponse.token_id,
          save_token_id: formData.save_card
        }
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert 
          type="error" 
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <Input
        label="Card Number"
        type="text"
        name="card_number"
        value={formData.card_number}
        onChange={handleChange}
        placeholder="4811 1111 1111 1114"
        maxLength="19"
      />

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Expiry Month (MM)"
          type="text"
          name="card_exp_month"
          value={formData.card_exp_month}
          onChange={handleChange}
          placeholder="12"
          maxLength="2"
        />
        <Input
          label="Expiry Year (YY)"
          type="text"
          name="card_exp_year"
          value={formData.card_exp_year}
          onChange={handleChange}
          placeholder="25"
          maxLength="2"
        />
        <Input
          label="CVV"
          type="password"
          name="card_cvv"
          value={formData.card_cvv}
          onChange={handleChange}
          placeholder="123"
          maxLength="4"
        />
      </div>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="save_card"
          checked={formData.save_card}
          onChange={handleChange}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">Save card for future payments</span>
      </label>

      <Button
        type="button"
        variant="primary"
        className="w-full"
        disabled={isLoading}
        onClick={handleSubmit}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <LoadingSpinner size="small" />
            <span className="ml-2">Processing...</span>
          </div>
        ) : (
          'Pay with Credit Card'
        )}
      </Button>

      <p className="text-xs text-gray-500 mt-2">
        Your card information is secured using industry-standard encryption.
      </p>
    </div>
  );
};

// Main PaymentMethodSelection Component
const PaymentMethodSelection = ({ onSelect, isLoading }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  const paymentMethods = [
    {
      id: 'credit_card',
      name: 'Credit Card',
      icon: CreditCard,
      component: CreditCardForm,
      description: 'Pay securely with your credit card'
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: Building2,
      description: 'Pay using bank transfer',
      options: [
        { id: 'bca', name: 'BCA Virtual Account' },
        { id: 'bni', name: 'BNI Virtual Account' },
        { id: 'bri', name: 'BRI Virtual Account' },
        { id: 'mandiri', name: 'Mandiri Virtual Account' },
        { id: 'permata', name: 'Permata Virtual Account' }
      ]
    },
    {
      id: 'ewallet',
      name: 'E-Wallet',
      icon: Wallet,
      description: 'Pay with your preferred e-wallet',
      options: [
        { id: 'gopay', name: 'GoPay' },
        { id: 'qris', name: 'QRIS' }
      ]
    }
  ];

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setSelectedOption(null);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    
    if (selectedMethod.id === 'bank_transfer') {
      onSelect({
        payment_type: 'bank_transfer',
        bank_transfer: {
          bank: option.id
        }
      });
    } else if (selectedMethod.id === 'ewallet') {
      if (option.id === 'gopay') {
        onSelect({
          payment_type: 'gopay',
          gopay: {
            enable_callback: true,
            callback_url: process.env.REACT_APP_GOPAY_CALLBACK_URL
          }
        });
      } else if (option.id === 'qris') {
        onSelect({
          payment_type: 'qris',
          qris: {
            acquirer: "gopay"
          }
        });
      }
    }
  };

  const renderPaymentForm = () => {
    if (!selectedMethod) return null;

    if (selectedMethod.component) {
      const PaymentComponent = selectedMethod.component;
      return (
        <div className="mt-6">
          <PaymentComponent onSubmit={onSelect} isLoading={isLoading} />
        </div>
      );
    }

    if (selectedMethod.options?.length > 0) {
      return (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Select {selectedMethod.name} Provider
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {selectedMethod.options.map((option) => (
              <div
                key={option.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors
                  ${selectedOption?.id === option.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'}`}
                onClick={() => handleOptionSelect(option)}
              >
                <span className="font-medium">{option.name}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors
              ${selectedMethod?.id === method.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'}`}
            onClick={() => handleMethodSelect(method)}
          >
            <div className="flex items-center space-x-3">
              <method.icon className="w-6 h-6 text-gray-600" />
              <div>
                <span className="font-medium block">{method.name}</span>
                <span className="text-sm text-gray-500">{method.description}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Form or Options */}
      {renderPaymentForm()}
    </div>
  );
};

export default PaymentMethodSelection;