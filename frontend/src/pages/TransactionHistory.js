import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertCircle, CheckCircle, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import paymentService from '../services/paymentService';
import Button from '../components/ui/Button';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedRow, setExpandedRow] = useState(null);
  const location = useLocation();

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage]);

  const fetchTransactions = async (page) => {
    try {
      setLoading(true);
      const response = await paymentService.getTransactions(page);
      setTransactions(response.data);
      setTotalPages(response.meta?.total_pages || 1);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderQRCode = (transaction) => {
    if (transaction.payment_type === 'bank_transfer') return null;

    if (transaction.qr_code?.url) {
      return (
        <div className="mt-4 flex flex-col items-center">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Payment QR Code</h4>
          <img
            src={transaction.qr_code.url}
            alt="Payment QR Code"
            className="max-w-[200px] h-auto"
          />
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => window.open(transaction.qr_code.url, '_blank')}
          >
            Open QR Code
          </Button>
        </div>
      );
    }

    if (transaction.qr_string) {
      return (
        <div className="mt-4 flex flex-col items-center">
          <h4 className="text-sm font-medium text-gray-700 mb-2">QRIS Code</h4>
          <img
            src={`data:image/png;base64,${transaction.qr_string}`}
            alt="QRIS Code"
            className="max-w-[200px] h-auto"
          />
        </div>
      );
    }

    return null;
  };

  

  const renderPaymentDetails = (transaction) => {
    if (!transaction.payment_details) return null;

    let paymentDetails;
    try {
      paymentDetails = typeof transaction.payment_details === 'string' 
        ? JSON.parse(transaction.payment_details) 
        : transaction.payment_details;
    } catch (error) {
      console.error('Error parsing payment details:', error);
      return null;
    }

    const {
      transaction_id,
      transaction_time,
      transaction_status,
      currency,
      va_numbers = []
    } = paymentDetails;

    return (
      <div className="p-4 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Transaction ID:</p>
            <p className="font-medium">{transaction_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status:</p>
            <p className="font-medium capitalize">{transaction_status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Time:</p>
            <p className="font-medium">{transaction_time}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Currency:</p>
            <p className="font-medium">{currency}</p>
          </div>
          
          {/* Virtual Account Numbers */}
          {va_numbers.length > 0 && (
            <div className="col-span-2">
              <p className="text-sm text-gray-600 mb-2">Virtual Account:</p>
              {va_numbers.map((va, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <p className="font-medium">
                    {va.bank.toUpperCase()} - {va.va_number}
                  </p>
                  <button
                    onClick={() => copyToClipboard(va.va_number)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Copy className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* QR Code */}
          <div className="col-span-2">
            {renderQRCode(transaction)}
          </div>

        </div>
      </div>
    );
  };

  const renderPaymentAlert = () => {
    if (!location.state?.transactionData) return null;

    const { orderId, amount, status } = location.state.transactionData;

    return (
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-start">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Payment Information</h3>
            <div className="mt-1 text-sm text-blue-700">
              <p>Order ID: {orderId}</p>
              <p>Amount: Rp {Number(amount).toLocaleString()}</p>
              <p>Status: {status}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Transaction History</h1>
      
      {renderPaymentAlert()}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <React.Fragment key={transaction.id}>
                <tr className="hover:bg-gray-50">
                  <td className="pl-4">
                    <button
                      onClick={() => setExpandedRow(expandedRow === transaction.id ? null : transaction.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {expandedRow === transaction.id ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.order_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Rp {Number(transaction.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {transaction.payment_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${transaction.status === 'success' ? 'bg-green-100 text-green-800' : ''}
                      ${transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${transaction.status === 'failed' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.created_at)}
                  </td>
                </tr>
                {expandedRow === transaction.id && (
                  <tr>
                    <td colSpan="6" className="bg-gray-50 border-b">
                      {renderPaymentDetails(transaction)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default TransactionHistory;