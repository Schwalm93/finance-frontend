import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CryptoChartBitcoin from './CryptoChartBitcoin';
import CryptoChartEthereum from './CryptoChartEthereum';

const CryptoPrices: React.FC = () => {
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [ethPrice, setEthPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/crypto/prices');
        const data = response.data;
        setBtcPrice(data.bitcoin.eur);
        setEthPrice(data.ethereum.eur);
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
      }
    };

    fetchPrices();

    const interval = setInterval(fetchPrices, 300000); // Aktualisierung alle 5 Minuten

    return () => clearInterval(interval); // Aufräumen, wenn das Komponenten-Unmounted wird
  }, []);

  return (
    <div>
      <h3><img src="https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg" alt="Bitcoin"
        style={{ width: '36px', height: '36px', marginRight: '8px', marginBottom: '8px', verticalAlign: 'middle' }} /> {btcPrice !== null ? `${btcPrice}€` : 'Loading...'}</h3>
      <CryptoChartBitcoin />
      <br />
      <h3><img src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Ethereum-icon-purple.svg" alt="Ethereum"
        style={{ width: '36px', height: '36px', marginTop: '-1px', marginRight: '8px', verticalAlign: 'middle' }} /> {ethPrice !== null ? `${ethPrice}€` : 'Loading...'}</h3>
      <CryptoChartEthereum />
    </div>
  );
};

export default CryptoPrices;
