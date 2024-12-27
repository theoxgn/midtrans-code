const db = require('../config/database');

class Transaction {
  // static async create({ orderId, amount, paymentType, payment_details, status = 'pending' }) {
  //   const query = `
  //     INSERT INTO transactions (order_id, amount, payment_type, payment_details, status)
  //     VALUES ($1, $2, $3, $4, $5)
  //     RETURNING *
  //   `;
  //   const values = [orderId, amount, paymentType, payment_details, status];
  //   const { rows } = await db.query(query, values);
  //   return rows[0];
  // }
  
  static async create({ orderId, amount, paymentType, payment_details, status = 'pending' }) {
    const query = `
      INSERT INTO transactions (
        order_id, 
        amount, 
        payment_type, 
        payment_details,
        status
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    // Convert payment_details object to JSON string if it's an object
    const paymentDetailsJson = typeof payment_details === 'object' ? 
      JSON.stringify(payment_details) : 
      payment_details;
    
    const values = [
      orderId,  // This should match the order_id in the database
      amount,
      paymentType,
      paymentDetailsJson,
      status
    ];
    
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Transaction Create Error:', error);
      throw error;
    }
  }

  static async updateStatus(orderId, status) {
    const query = `
      UPDATE transactions
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE order_id = $2
      RETURNING *
    `;
    const values = [status, orderId];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async getByOrderId(orderId) {
    const query = 'SELECT * FROM transactions WHERE order_id = $1';
    const { rows } = await db.query(query, [orderId]);
    return rows[0];
  }

  static async getByUserId(userId) {
    const query = `
      SELECT * FROM transactions 
      ORDER BY created_at DESC
    `;
    const { rows } = await db.query(query, [userId]);
    return rows;
  }

  static async find({ limit = 10, offset = 0, orderBy = 'created_at', order = 'DESC' }) {
    const query = `
      SELECT * FROM transactions
      ORDER BY ${orderBy} ${order}
      LIMIT $1 OFFSET $2
    `;
    const { rows } = await db.query(query, [limit, offset]);
    return rows;
  }

  static async count() {
    const query = 'SELECT COUNT(*) as total FROM transactions';
    const { rows } = await db.query(query);
    return parseInt(rows[0].total);
  }
  
}

module.exports = Transaction;