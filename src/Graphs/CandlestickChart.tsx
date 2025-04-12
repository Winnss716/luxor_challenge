import React, { useMemo } from 'react';
import * as d3 from 'd3';
import './CandlestickChart.css';

interface Bid {
    date?: string; // ISO string, e.g., "2023-01-01T00:00:00Z"
    price: number;
}

interface TickerData {
    date: Date;
    open: number;
    close: number;
    high: number;
    low: number;
}

interface CandlestickChartProps {
    bids: Bid[]; // Use Bid data instead of TickerData
    width?: number;
    height?: number;
}

interface Tick {
    value: string | number;
    x?: number;
    y?: number;
    label: string;
}

interface Candlestick {
    x: number;
    high: number;
    low: number;
    open: number;
    close: number;
    stroke: string;
    bandwidth: number;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({
    bids,
    width = 350,
    height = 400,
}) => {
    // Chart dimensions and margins
    const marginTop = 20;
    const marginRight = 30;
    const marginBottom = 30;
    const marginLeft = 40;

    // Aggregate bids into OHLC data per day
    const ticker = useMemo((): TickerData[] => {
        if (!bids.length) return [];

        // Group bids by date (truncate to day)
        const bidsByDate = d3.group(
            bids.filter((b): b is { date: string; price: number } => !!b.date && !isNaN(b.price)),
            (b) => d3.utcDay(new Date(b.date)).toISOString()
        );

        // Create OHLC data
        return Array.from(bidsByDate, ([dateStr, dailyBids]) => {
            const prices = dailyBids.map((b) => b.price);
            const date = new Date(dateStr);
            return {
                date,
                open: prices[0], // First price of the day
                close: prices[prices.length - 1], // Last price
                high: d3.max(prices)!, // Highest price
                low: d3.min(prices)!, // Lowest price
            };
        }).filter((d) => !isNaN(d.date.getTime()) && d.low > 0);
    }, [bids]);

    // Compute scales and chart elements
    const chartData = useMemo(() => {
        if (!ticker.length) return { xTicks: [] as Tick[], yTicks: [] as Tick[], candlesticks: [] as Candlestick[] };

        // Validate ticker data
        const minLow = d3.min(ticker, (d: TickerData) => d.low);
        const maxHigh = d3.max(ticker, (d: TickerData) => d.high);
        if (minLow === undefined || maxHigh === undefined || minLow <= 0) {
            console.warn('Invalid ticker data for log scale');
            return { xTicks: [], yTicks: [], candlesticks: [] };
        }

        // X-scale: Map dates to strings for scaleBand
        const dates = d3
            .utcDay
            .range(ticker[0].date, new Date(ticker[ticker.length - 1].date.getTime() + 24 * 60 * 60 * 1000))
            .filter((d) => d.getUTCDay() !== 0 && d.getUTCDay() !== 6)
            .map((d) => d.toISOString());

        const x = d3
            .scaleBand()
            .domain(dates)
            .range([marginLeft, width - marginRight])
            .padding(0.2);

        // Y-scale: Log scale for price
        const y = d3
            .scaleLog()
            .domain([minLow, maxHigh])
            .rangeRound([height - marginBottom, marginTop]);

        // X-axis ticks (Mondays)
        const xTicks: Tick[] = d3
            .utcMonday
            .every(width > 720 ? 1 : 2)!
            .range(ticker[0].date, ticker[ticker.length - 1].date)
            .filter((d) => dates.includes(d.toISOString()))
            .map((d) => ({
                value: d.toISOString(),
                x: (x(d.toISOString()) ?? 0) + (x.bandwidth() / 2), // Center of band
                label: d3.utcFormat('%-m/%-d')(d),
            }));

        // Y-axis ticks
        const yTicks: Tick[] = d3
            .scaleLinear()
            .domain(y.domain())
            .ticks()
            .map((value) => ({
                value,
                y: y(value),
                label: d3.format('$~f')(value),
            }));

        // Candlesticks
        const candlesticks: Candlestick[] = ticker
            .map((d) => {
                const xPos = x(d.date.toISOString());
                if (xPos === undefined) return null;
                return {
                    x: xPos,
                    high: y(d.high),
                    low: y(d.low),
                    open: y(d.open),
                    close: y(d.close),
                    stroke: d.open > d.close ? d3.schemeSet1[0] : d.close > d.open ? d3.schemeSet1[2] : d3.schemeSet1[8],
                    bandwidth: x.bandwidth(),
                };
            })
            .filter((d): d is Candlestick => d !== null);

        return { xTicks, yTicks, candlesticks };
    }, [ticker, width, height]);

    return (
        <div className="candlestick-chart-container">
            <svg width={width} height={height}>
                {/* X-axis ticks */}
                <g transform={`translate(0,${height - marginBottom})`}>
                    {chartData.xTicks.map((tick) => (
                        <React.Fragment key={tick.value}>
                            <line
                                x1={tick.x}
                                x2={tick.x}
                                y1={0}
                                y2={6}
                                stroke="#FFFFFF"
                            />
                            <text
                                x={tick.x}
                                y={20}
                                text-anchor="middle"
                                font-size="10"
                                fill="#FFFFFF"
                            >
                                {tick.label}
                            </text>
                        </React.Fragment>
                    ))}
                </g>

                {/* Y-axis ticks and grid lines */}
                <g transform={`translate(${marginLeft},0)`}>
                    {chartData.yTicks.map((tick) => (
                        <React.Fragment key={tick.value}>
                            <line
                                x1={0}
                                x2={-6}
                                y1={tick.y}
                                y2={tick.y}
                                stroke="#FFFFFF"
                            />
                            <line
                                x1={0}
                                x2={width - marginLeft - marginRight}
                                y1={tick.y}
                                y2={tick.y}
                                stroke="#FFFFFF"
                                stroke-opacity="0.2"
                            />
                            <text
                                x={-10}
                                y={tick.y}
                                text-anchor="end"
                                dominant-baseline="middle"
                                font-size="10"
                                fill="#FFFFFF"
                            >
                                {tick.label}
                            </text>
                        </React.Fragment>
                    ))}
                </g>

                {/* Candlesticks */}
                <g stroke="#FFFFFF" stroke-linecap="round">
                    {chartData.candlesticks.map((candle, i) => (
                        <g key={i} transform={`translate(${candle.x},0)`}>
                            {/* High-low line */}
                            <line
                                x1={0}
                                x2={0}
                                y1={candle.low}
                                y2={candle.high}
                                stroke="#FFFFFF"
                            />
                            {/* Open-close line */}
                            <line
                                x1={0}
                                x2={0}
                                y1={candle.open}
                                y2={candle.close}
                                stroke-width={candle.bandwidth}
                                stroke={candle.stroke}
                            />
                        </g>
                    ))}
                </g>
            </svg>
        </div>
    );
};

export default CandlestickChart;