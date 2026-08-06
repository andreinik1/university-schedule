import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from '../DeanPage.module.scss';

interface ChartDataItem {
    date: string;
    total: number;
}

interface DeanChartProps {
    chartData: ChartDataItem[];
}

export const DeanChart: React.FC<DeanChartProps> = ({ chartData }) => {
    return (
        <div className={`${styles.chartCard} no-print`}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" fontSize={10} tickMargin={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#3b82f6"
                        strokeWidth={4}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
