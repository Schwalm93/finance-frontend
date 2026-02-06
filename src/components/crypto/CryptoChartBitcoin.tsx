import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import "chart.js/auto";


const CryptoChartBitcoin = () => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<Chart | null>(null); // Typisierung für die Chart-Instanz

    useEffect(() => {
        const fetchData = async () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.clear();
                chartInstanceRef.current.destroy();
            }

            const res = await fetch('http://localhost:8080/api/crypto/chart/bitcoin');
            const data = await res.json();

            const chartData = data.prices.map((price: [number, number]) => ({
                x: price[0],
                y: price[1].toFixed(2),
            }));

            if (chartRef.current) {
                const ctx = chartRef.current.getContext('2d');
                if (ctx) {
                    chartInstanceRef.current = new Chart(ctx, {
                        type: 'line',
                        data: {
                            datasets: [{
                                label: 'BTC in EUR',
                                data: chartData,
                                fill: false,
                                borderColor: 'rgb(247, 147, 26)',
                                pointRadius: 1,
                            }]
                        },
                        options: {
                            scales: {
                                x: {
                                    type: 'time',
                                    time: {
                                        unit: 'day'
                                    }
                                }
                            }
                        }
                    });
                }
            }
        };

        fetchData();

        // const interval = setInterval(fetchData, 60000); // Aktualisierung alle 60 Sekunden

        // return () => {
        //     chartInstanceRef.current?.destroy();
        //     () => clearInterval(interval)
        // };
    }, []);

    return <canvas ref={chartRef}></canvas>;
};

export default CryptoChartBitcoin;

