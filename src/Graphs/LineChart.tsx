import React, { useMemo } from 'react';
import * as d3 from 'd3';
import './LineChart.css';

// Full Bid interface
interface BidData {
    id: string;
    collection_id: number;
    user_id: string;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | null;
    date?: string; // ISO string, e.g., "2023-01-01T00:00:00Z"
    price: number;
    number_bids?: number;
}

interface LineChartProps {
    data: BidData[];
    basis?: number; // Normalization factor (e.g., first price value)
    width?: number;
    height?: number;
}

interface Tick {
    value: Date | number;
    x?: number;
    y?: number;
    label: string;
    isOne?: boolean; // For 0% line
}

interface ParsedBidData {
    date: Date;
    price: number;
}

interface ChartData {
    xTicks: Tick[];
    yTicks: Tick[];
    linePath: string;
}

const LineChart: React.FC<LineChartProps> = ({
    data,
    basis = data[0]?.price || 1,
    width = 350,
    height = 400,
}) => {
    // Chart dimensions and margins
    const marginTop = 20;
    const marginRight = 30;
    const marginBottom = 30;
    const marginLeft = 50;

    // Compute scales and chart elements using useMemo
    const chartData = useMemo((): ChartData => {
        if (!data.length || basis <= 0) {
            console.warn('Invalid data or basis for line chart');
            return { xTicks: [], yTicks: [], linePath: '' };
        }

        // Parse date strings to Date objects, filter invalid entries
        const parsedData: ParsedBidData[] = data
            .filter((d): d is BidData & { date: string } => !!d.date && !isNaN(d.price))
            .map((d) => ({
                date: new Date(d.date),
                price: d.price,
            }))
            .filter((d) => !isNaN(d.date.getTime()));

        if (!parsedData.length) {
            console.warn('No valid dates or prices in data');
            return { xTicks: [], yTicks: [], linePath: '' };
        }

        // X-scale: Time-based
        const xExtent = d3.extent(parsedData, (d: ParsedBidData) => d.date) as [Date, Date];
        if (!xExtent[0] || !xExtent[1]) {
            console.warn('Invalid date range in data');
            return { xTicks: [], yTicks: [], linePath: '' };
        }
        const x = d3.scaleUtc().domain(xExtent).range([marginLeft, width - marginRight]);

        // Y-scale: Logarithmic, normalized by basis
        const min = d3.min(parsedData, (d: ParsedBidData) => d.price / basis * 0.9);
        const max = d3.max(parsedData, (d: ParsedBidData) => d.price / basis / 0.9);
        if (!min || !max || min <= 0 || max <= 0) {
            console.warn('Invalid Y domain for log scale');
            return { xTicks: [], yTicks: [], linePath: '' };
        }
        const y = d3
            .scaleLog()
            .domain([min, max])
            .rangeRound([height - marginBottom, marginTop]);

        // X-axis ticks
        const xTicks: Tick[] = x
            .ticks(width / 80)
            .map((value: Date) => ({
                value,
                x: x(value),
                label: d3.utcFormat('%-m/%-d')(value),
            }));

        // Y-axis ticks
        const f = d3.format('+.0%');
        const format = (x: number) => (x === 1 ? '0%' : f(x - 1));
        const [yMin, yMax] = y.domain();
        const yTicks: Tick[] = d3
            .ticks(yMin, yMax, 10)
            .map((value: number) => ({
                value,
                y: y(value),
                label: format(value),
                isOne: value === 1,
            }));

        // Line path
        const line = d3
            .line<ParsedBidData>()
            .x((d: ParsedBidData) => x(d.date))
            .y((d: ParsedBidData) => y(d.price / basis));
        const linePath = line(parsedData) || '';

        return { xTicks, yTicks, linePath };
    }, [data, basis, width, height]);

    return (
        <div className="line-chart-container">
            <svg width={width} height={height}>
                {/* X-axis (at y=1, 0% change) */}
                <g transform={`translate(0,${chartData.yTicks.find((t: Tick) => t.isOne)?.y ?? height - marginBottom})`}>
                    {chartData.xTicks.map((tick) => (
                        <React.Fragment key={tick.value instanceof Date ? tick.value.getTime().toString() : String(tick.value)}>
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
                        <React.Fragment key={typeof tick.value === 'number' ? String(tick.value) : tick.value.getTime().toString()}>
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
                                stroke-opacity={tick.isOne ? 1 : 0.2}
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

                {/* Line path */}
                <path
                    d={chartData.linePath}
                    fill="none"
                    stroke="#4A90E2"
                    stroke-width="1.5"
                    stroke-linejoin="round"
                    stroke-linecap="round"
                />
            </svg>
        </div>
    );
};

export default LineChart;