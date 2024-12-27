import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import LoadingSpinner from '../ui/LoadingSpinner';
import paymentService from '../../services/paymentService';

const CreditCardForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    card_number: '4811 1111 1111 1114',
    card_exp_month: '12',
    card_exp_year: '2025',
    card_cvv: '123'
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // First get the card token
      const tokenResponse = await paymentService.getCardToken(formData);
      
      if (!tokenResponse?.token_id) {
        throw new Error('Failed to generate card token');
      }

      // Submit the token to the parent component
      onSubmit({
        payment_type: 'credit_card',
        credit_card: {
          token_id: tokenResponse.token_id
        }
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        placeholder="4111 1111 1111 1111"
      />

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Expiry Month"
          type="text"
          name="card_exp_month"
          value={formData.card_exp_month}
          onChange={handleChange}
          placeholder="MM"
        />
        <Input
          label="Expiry Year"
          type="text"
          name="card_exp_year"
          value={formData.card_exp_year}
          onChange={handleChange}
          placeholder="YY"
        />
        <Input
          label="CVV"
          type="text"
          name="card_cvv"
          value={formData.card_cvv}
          onChange={handleChange}
          placeholder="123"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? <LoadingSpinner size="small" /> : 'Process Payment'}
      </Button>
    </form>
  );
};

export default CreditCardForm;