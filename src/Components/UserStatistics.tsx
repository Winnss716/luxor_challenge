import React from 'react';
import LineChart from '../Graphs/LineChart';
import CandlestickChart from '../Graphs/CandlestickChart';
import './UserStatistics.css';

// Full Bid interface
interface Bid {
    id: string;
    collection_id: number;
    user_id: string;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | null;
    date?: string; // ISO string, e.g., "2023-01-01T00:00:00Z"
    price: number;
    number_bids?: number;
}

// Mock data for LineChart (30 days, upward trend)
const mockLineData: Bid[] = Array.from({ length: 30 }, (_, i) => {
    const date = new Date('2023-01-01T00:00:00Z');
    date.setUTCDate(date.getUTCDate() + i);
    const basePrice = 200 + i * 1.67; // Linear increase from $200 to ~$250
    const fluctuation = Math.sin(i / 2) * 5; // Small sine wave
    return {
        id: `line-bid-${i}`,
        collection_id: 1,
        user_id: 'user1',
        status: 'pending',
        date: date.toISOString(),
        price: parseFloat((basePrice + fluctuation).toFixed(2)),
    };
});

// Mock data for CandlestickChart (90 days, varied OHLC)
const mockCandlestickData: Bid[] = Array.from({ length: 270 }, (_, i) => {
    const date = new Date('2022-10-04T00:00:00Z'); // 90 days before Jan 1, 2023
    date.setUTCHours(date.getUTCHours() + i * 8); // ~3 bids/day
    const day = date.getUTCDate();
    const basePrice = 200 + Math.sin(day / 10) * 30; // Cyclical, $170-$230
    const volatility = Math.random() * 20 - 10; // ±$10
    return {
        id: `candle-bid-${i}`,
        collection_id: 1,
        user_id: 'user1',
        status: 'pending',
        date: date.toISOString(),
        price: parseFloat((basePrice + volatility).toFixed(2)),
    };
});

const UserStatistics: React.FC = () => {
    return (
        <div className="statistics-page">
            <h2>Bid Price Trends</h2>
            {mockLineData.length === 0 && mockCandlestickData.length === 0 ? (
                <p className="no-data">No bid data available</p>
            ) : (
                <div className="chart-container">
                    <div className="chart">
                        <h3>Price Trend (Last 30 Days, Line)</h3>
                        <LineChart data={mockLineData} />
                    </div>
                    <div className="chart">
                        <h3>Price Trend (Last 90 Days, Candlestick)</h3>
                        <CandlestickChart bids={mockCandlestickData} />
                    </div>
                </div>
            )}
            <button className="stats-button">View Details</button>
        </div>
    );
};

export default UserStatistics;