import dynamic from 'next/dynamic';
import Header from '../components-header';
import Products from '../components-products';
import Checkout from '../components-checkout';
import Help from '../components-help';

export default function Home() {
  return (
    <div>
      <Header />
      <main style={{ padding: '2rem 0' }}>
        <Products />
        <Checkout />
      </main>
      <Help />
    </div>
  );
}
