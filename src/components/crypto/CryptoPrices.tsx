import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CryptoChartBitcoin from './CryptoChartBitcoin';
import CryptoChartEthereum from './CryptoChartEthereum';
import './CryptoPrices.css';

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
    <div className="crypto-prices">
      <section className="crypto-prices__item">
        <h3 className="crypto-prices__heading">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg"
            alt="Bitcoin"
            className="crypto-prices__icon"
          />
          <span>{btcPrice !== null ? `${btcPrice}€` : 'Loading...'}</span>
        </h3>
        <div className="crypto-prices__chart">
          <CryptoChartBitcoin />
        </div>
      </section>
      <section className="crypto-prices__item">
        <h3 className="crypto-prices__heading">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Ethereum-icon-purple.svg"
            alt="Ethereum"
            className="crypto-prices__icon"
          />
          <span>{ethPrice !== null ? `${ethPrice}€` : 'Loading...'}</span>
        </h3>
        <div className="crypto-prices__chart">
          <CryptoChartEthereum />
        </div>
      </section>
    </div>
  );
};

export default CryptoPrices;
