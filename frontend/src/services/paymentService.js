import api from '../utils/api';

const paymentService = {
  createPayment: async (data) => {
    try {
      const response = await api.post('/payment/create', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create payment');
    }
  },
  
  getCardToken: async (cardData) => {
    try {
      const response = await api.post('/payment/card/token', cardData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate card token');
    }
  },

  getTransactions: async (page = 1) => {
    try {
      const response = await api.get(`/payment/transactions?page=${page}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
    }
  },

  getStatus: async (orderId) => {
    try {
      const response = await api.get(`/payment/status/${orderId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get status');
    }
  }
};

export default paymentService;