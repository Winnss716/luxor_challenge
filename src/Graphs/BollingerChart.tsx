import React, { useMemo } from 'react';
import * as d3 from 'd3';
import './BollingerChart.css';

interface Bid {
    date?: string; // ISO string, e.g., "2023-01-01T00:00:00Z"
    price: number;
}

interface StockData {
    date: Date;
    close: number;
}

interface BollingerChartProps {
    bids: Bid[]; // Use Bid data instead of StockData
    N?: number; // Period for moving average (default: 20)
    K?: number; // Standard deviation multiplier (default: 2)
    width?: number;
    height?: number;
}

interface Tick {
    value: number | Date;
    x?: number;
    y?: number;
    label: string;
}

interface PathData {
    d: string;
    stroke: string;
}

// Bollinger Bands calculation
function bollinger(values: Float64Array, N: number, K: number): number[][] {
    const middle: number[] = [];
    const upper: number[] = [];
    const lower: number[] = [];

    for (let i = 0; i < values.length; i++) {
        if (i < N - 1) {
            middle.push(NaN);
            upper.push(NaN);
            lower.push(NaN);
            continue;
        }

        const slice = values.slice(i - N + 1, i + 1);
        const mean = d3.mean(slice) || 0;
        const variance = d3.mean(slice, (v: number) => (v - mean) ** 2) || 0;
        const stdDev = Math.sqrt(variance);

        middle.push(mean);
        upper.push(mean + K * stdDev);
        lower.push(mean - K * stdDev);
    }

    return [lower, middle, upper];
}

const BollingerChart: React.FC<BollingerChartProps> = ({
    bids,
    N = 20,
    K = 2,
    width = 350,
    height = 400,
}) => {
    // Chart dimensions and margins
    const marginTop = 10;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 40;

    // Map bids to StockData
    const data = useMemo((): StockData[] => {
        return bids
            .filter((b): b is { date: string; price: number } => !!b.date && !isNaN(b.price))
            .map((b) => ({
                date: new Date(b.date),
                close: b.price,
            }))
            .filter((d) => !isNaN(d.date.getTime()));
    }, [bids]);

    // Compute scales and chart elements
    const chartData = useMemo(() => {
        if (!data.length) {
            console.warn('Invalid data for Bollinger chart');
            return { xTicks: [] as Tick[], yTicks: [] as Tick[], paths: [] as PathData[] };
        }

        // Values array
        const values = Float64Array.from(data, (d) => d.close);

        // X-scale: Time-based
        const xExtent = d3.extent(data, (d: StockData) => d.date) as [Date, Date];
        if (!xExtent[0] || !xExtent[1]) {
            console.warn('Invalid date range');
            return { xTicks: [], yTicks: [], paths: [] };
        }
        const x = d3.scaleTime().domain(xExtent).rangeRound([marginLeft, width - marginRight]);

        // Y-scale: Logarithmic
        const yExtent = d3.extent(values) as [number, number];
        if (!yExtent[0] || !yExtent[1] || yExtent[0] <= 0) {
            console.warn('Invalid Y domain for log scale');
            return { xTicks: [], yTicks: [], paths: [] };
        }
        const y = d3
            .scaleLog()
            .domain(yExtent)
            .rangeRound([height - marginBottom - 20, marginTop]);

        // X-axis ticks
        const xTicks: Tick[] = x
            .ticks(width / 80)
            .map((value: Date) => ({
                value,
                x: x(value),
                label: d3.utcFormat('%-m/%-d')(value),
            }));

        // Y-axis ticks
        const [yMin, yMax] = y.domain();
        const yTicks: Tick[] = d3
            .ticks(yMin, yMax, 10)
            .map((value: number) => ({
                value,
                y: y(value),
                label: value.toFixed(2), // Format as currency-like
            }));

        // Line generator
        const line = d3
            .line<number>()
            .defined((d, i) => !isNaN(data[i].date.getTime()) && !isNaN(d))
            .x((_, i) => x(data[i].date))
            .y((d) => y(d));

        // Bollinger Bands
        const bands = bollinger(values, N, K);
        const paths: PathData[] = [values, ...bands].map((d, i) => ({
            d: line(d) || '',
            stroke: i === 0 ? '#4A90E2' : i === 1 ? '#28A745' : i === 2 ? '#FF4D4F' : '#B0B0B0', // Close, middle, upper, lower
        }));

        return { xTicks, yTicks, paths };
    }, [data, N, K, width, height]);

    return (
        <div className="bollinger-chart-container">
            <svg width={width} height={height}>
                {/* X-axis */}
                <g transform={`translate(0,${height - marginBottom})`}>
                    {chartData.xTicks.map((tick) => (
                        <React.Fragment key={tick.value instanceof Date ? tick.value.getTime().toString() : tick.value.toString()}>
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

                {/* Y-axis and grid lines */}
                <g transform={`translate(${marginLeft},0)`}>
                    {chartData.yTicks.map((tick) => (
                        <React.Fragment key={tick.value.toString()}>
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
                                stroke-opacity="0.1"
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
                    {/* Y-axis label */}
                    <text
                        x={3}
                        y={chartData.yTicks[chartData.yTicks.length - 1]?.y ?? marginTop}
                        text-anchor="start"
                        font-weight="bold"
                        font-size="10"
                        fill="#FFFFFF"
                    >
                        ↑ Bid Price ($)
                    </text>
                </g>

                {/* Lines (Close price and Bollinger Bands) */}
                <g fill="none" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">
                    {chartData.paths.map((path, i) => (
                        <path
                            key={i}
                            d={path.d}
                            stroke={path.stroke}
                        />
                    ))}
                </g>
            </svg>
        </div>
    );
};

export default BollingerChart;