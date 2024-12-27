import React from 'react';
import { BrowserRouter, Routes, Route, } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Payment from './pages/Payment';
import TransactionHistory from './pages/TransactionHistory';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/transactions" element={<TransactionHistory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;