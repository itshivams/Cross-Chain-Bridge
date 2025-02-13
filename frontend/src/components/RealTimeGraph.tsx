import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const COIN_HISTORY_API = (coin: string, days: number) =>
  `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${days}`;

export const RealTimeGraph = ({ selectedDays = 7 }: { selectedDays: number }) => {
  const [ethPriceHistory, setEthPriceHistory] = useState<number[]>([]);
  const [maticPriceHistory, setMaticPriceHistory] = useState<number[]>([]);
  const [timestamps, setTimestamps] = useState<string[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<"ethereum" | "matic-network">("ethereum");

  const fetchPriceHistory = async (coin: string, setPriceHistory: (data: number[]) => void) => {
    try {
      const response = await fetch(COIN_HISTORY_API(coin, selectedDays));
      const data = await response.json();
      const prices = data.prices.map((price: [number, number]) => price[1]);

      if (coin === "ethereum") {
        const times = data.prices.map((price: [number, number]) =>
          new Date(price[0]).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        );
        setTimestamps(times);
      }

      setPriceHistory(prices);
    } catch (error) {
      console.error(`Error fetching ${coin.toUpperCase()} price history:`, error);
    }
  };

  useEffect(() => {
    fetchPriceHistory("ethereum", setEthPriceHistory);
    fetchPriceHistory("matic-network", setMaticPriceHistory);
  }, [selectedDays]);

  const chartData = {
    labels: timestamps,
    datasets: [
      {
        label: `${selectedCoin === "ethereum" ? "ETH" : "MATIC"} Price (USD) - Last ${selectedDays} Days`,
        data: selectedCoin === "ethereum" ? ethPriceHistory : maticPriceHistory,
        fill: true,
        backgroundColor: selectedCoin === "ethereum" ? "rgba(75,192,192,0.2)" : "rgba(153,102,255,0.2)",
        borderColor: selectedCoin === "ethereum" ? "rgba(75,192,192,1)" : "rgba(153,102,255,1)",
        borderWidth: 2,
        pointRadius: 3,
      },
    ],
  };

  return (
    <div className="w-full max-w-md md:max-w-2xl my-6 mx-auto bg-white/5 backdrop-blur-lg border border-white/20 p-4 md:p-6 rounded-xl shadow-lg">
      {/* Tabs */}
      <div className="flex justify-center mb-4">
        <button
          className={`px-4 py-2 rounded-l-lg ${
            selectedCoin === "ethereum" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => setSelectedCoin("ethereum")}
        >
          Ethereum
        </button>
        <button
          className={`px-4 py-2 rounded-r-lg ${
            selectedCoin === "matic-network" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => setSelectedCoin("matic-network")}
        >
          Matic
        </button>
      </div>

      {/* Graph */}
      <div className="h-96">
        <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </div>
  );
};

