import React from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#1DB954', '#FF6384', '#36A2EB', '#FFCE56', '#845EC2', '#FF6F91'];

const MoodPieChart = ({ moodSummaries }) => {
    const tagCounts = moodSummaries.reduce((acc, item) => {
        acc[item.tag] = (acc[item.tag] || 0) + 1;
        return acc;
    }, {});

    const data = Object.entries(tagCounts).map(([tag, count]) => ({
        name: tag,
        value: count
    }));

    return (
        <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ marginBottom: '20px' }}>Mood Tag Distribution</h3>
            <PieChart width={400} height={300}>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                    dataKey="value"
                >
                    {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </div>
    );
};

export default MoodPieChart;