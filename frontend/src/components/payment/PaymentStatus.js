import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

const PaymentStatus = ({ status }) => {
  const navigate = useNavigate();
  const [showQRModal, setShowQRModal] = useState(false);

  const statusConfig = {
    success: {
      title: 'Payment Successful',
      message: 'Your payment has been processed successfully.',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    pending: {
      title: 'Payment Pending',
      message: 'Please complete your payment to proceed.',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    error: {
      title: 'Payment Failed',
      message: 'There was an error processing your payment.',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    closed: {
      title: 'Payment Cancelled',
      message: 'The payment window was closed.',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    }
  };

  const currentStatus = statusConfig[status.status];

  const renderEWalletInstructions = () => {
    if (!status.data?.payment_details) return null;

    const { payment_type, payment_details } = status.data;

    if (payment_type === 'gopay' && payment_details.actions) {
      const deeplink = payment_details.actions.find(action => action.name === 'deeplink-redirect');
      const qrCode = payment_details.actions.find(action => action.name === 'generate-qr-code');

      return (
        <div className="mt-4 space-y-4">
          <h4 className="font-medium text-gray-900">Payment Instructions:</h4>
          {deeplink && (
            <Button
              variant="primary"
              onClick={() => window.location.href = deeplink.url}
              className="w-full"
            >
              Open GoPay App
            </Button>
          )}
          {qrCode && (
            <Button
              variant="outline"
              onClick={() => setShowQRModal(true)}
              className="w-full"
            >
              Show QR Code
            </Button>
          )}
        </div>
      );
    }

    if (payment_type === 'qris' && payment_details.qr_string) {
      return (
        <div className="mt-4 space-y-4">
          <h4 className="font-medium text-gray-900">QRIS Payment Instructions:</h4>
          <div className="flex justify-center">
            <img 
              src={`data:image/png;base64,${payment_details.qr_string}`}
              alt="QRIS QR Code"
              className="max-w-xs"
            />
          </div>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>Open your e-wallet app (GoPay, OVO, DANA, etc.)</li>
            <li>Scan the QR code above</li>
            <li>Confirm and complete the payment in your app</li>
          </ol>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`rounded-lg ${currentStatus.bgColor} p-6`}>
      <h2 className={`text-2xl font-bold ${currentStatus.color} mb-4`}>
        {currentStatus.title}
      </h2>
      <p className="text-gray-700 mb-6">{currentStatus.message}</p>
      
      {status.data && (
        <div className="bg-white rounded p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Transaction Details</h3>
          <dl className="grid grid-cols-1 gap-2">
            <div className="grid grid-cols-2">
              <dt className="text-gray-600">Order ID:</dt>
              <dd className="text-gray-900">{status.data.orderId}</dd>
            </div>
            <div className="grid grid-cols-2">
              <dt className="text-gray-600">Amount:</dt>
              <dd className="text-gray-900">
                Rp {Number(status.data.amount).toLocaleString()}
              </dd>
            </div>
            <div className="grid grid-cols-2">
              <dt className="text-gray-600">Payment Method:</dt>
              <dd className="text-gray-900">{status.data.paymentType}</dd>
            </div>
          </dl>
        </div>
      )}

      {renderEWalletInstructions()}

      <div className="flex space-x-4">
        <Button
          variant="primary"
          onClick={() => navigate('/transactions')}
        >
          View Transactions
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </div>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="Scan QR Code"
      >
        {status.data?.payment_details?.actions?.find(action => action.name === 'generate-qr-code')?.url && (
          <div className="flex flex-col items-center">
            <img 
              src={status.data.payment_details.actions.find(action => action.name === 'generate-qr-code').url}
              alt="Payment QR Code"
              className="max-w-xs mb-4"
            />
            <p className="text-sm text-gray-600 text-center">
              Open your GoPay app and scan this QR code to complete the payment
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentStatus;