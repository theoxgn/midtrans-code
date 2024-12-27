export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  export const getPaymentStatusColor = (status) => {
    const statusColors = {
      success: 'text-green-600 bg-green-100',
      pending: 'text-yellow-600 bg-yellow-100',
      failed: 'text-red-600 bg-red-100',
      expired: 'text-gray-600 bg-gray-100'
    };
    return statusColors[status] || 'text-gray-600 bg-gray-100';
  };
  
  export const validateAmount = (amount) => {
    const numberAmount = Number(amount);
    if (isNaN(numberAmount)) return false;
    if (numberAmount <= 0) return false;
    return true;
  };