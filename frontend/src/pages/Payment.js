import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PaymentForm from '../components/payment/PaymentForm';
import Alert from '../components/ui/Alert';
import paymentService from '../services/paymentService';

const Payment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product;

  const handlePayment = async (paymentData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await paymentService.createPayment(paymentData);
      
      if (response.status === 'success') {
        navigate('/transactions', { 
          state: { 
            paymentSuccess: true,
            transactionData: {
              orderId: response.data.order_id,
              status: 'pending',
              amount: response.data.amount,
              paymentType: response.data.payment_type,
              ...response.data
            }
          }
        });
      } else {
        throw new Error(response.message || 'Payment creation failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect to home if no product is selected
  if (!product) {
    navigate('/');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
          className="mb-6"
        />
      )}

      <PaymentForm 
        onSubmit={handlePayment} 
        isLoading={isLoading}
        product={product}
      />
    </div>
  );
};

export default Payment;