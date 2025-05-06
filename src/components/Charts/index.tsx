import {
    PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart,
    Line, AreaChart, Area, Rectangle, ScatterChart, Scatter, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, RadialBarChart, RadialBar
} from "recharts";
import { ResponsiveContainer } from 'recharts';
import React, { useCallback } from 'react';
import WordCloud from "react-d3-cloud";

interface ChartsProps {
    data: any[];
    typeChart: string;
    colors: string[];
}

const removeEmojis = (text: string) =>
    String(text)
        .replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g, "") // Remove emojis
        .replace(/:\s*$/, ""); // Remove ":" no final das palavras

const Charts = ({ data, typeChart, colors }: ChartsProps) => {
    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center h-full">No data available</div>;
    }

    const truncateText = (text: string, maxLength: number) =>
        text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

    const commonProps = {
        margin: {
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
        }
    };

    const fontSize = useCallback(
        (word: { text: string; value: number }): number => {
            const values = data.map((item) => item.value);
            const maxValue = Math.max(...values);

            // Palavra com maior ocorrência
            const maxWord = data.reduce((prev, curr) =>
                curr.value > prev.value ? curr : prev
            ).name;
            const maxWordLength = maxWord.length;

            // Configurações do container
            const containerWidth = 1536; // max-w-6xl em pixels
            const containerHeight = 520; // h-[520] em pixels

            // Calcula o tamanho máximo da fonte para a maior palavra
            const maxFontSize = Math.min(
                containerWidth / maxWordLength,
                containerHeight * 0.8
            ); // Limita para caber no container
            const scale = (value: number) => value / maxValue;

            // Tamanhos com limites controlados
            const minFontSize = Math.max(maxFontSize * 0.08, 8); // Mínimo absoluto de 8px

            const calculatedFontSize =
                minFontSize + (maxFontSize - minFontSize) * scale(word.value);

            // Garante que a maior palavra tenha o tamanho máximo ajustado
            return word.value === maxValue ? maxFontSize : calculatedFontSize;
        },
        [data]
    );

    const fill = useCallback((_: any, i: number) => colors[i % colors.length], [colors]);

    const chartConfigs = {
        pie: (
            <div className="flex items-center gap-10">
                <ResponsiveContainer width="100%" height={350}>
                    <PieChart {...commonProps}>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={90}
                            outerRadius={120}
                            paddingAngle={3}
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="w-[450px] px-4 py-2 mr-10">
                    {data.map((entry: { name: string; value: number }, index: number) => (
                        <div key={index} className="flex items-center mb-2">
                            <div
                                className="w-4 h-4 rounded-full mr-2"
                                style={{ backgroundColor: colors[index % colors.length] }}
                            />
                            <span className="text-sm font-medium" title={entry.name}>
                                {truncateText(removeEmojis(entry.name), 30)}
                            </span>
                            <span className="text-sm font-semibold ml-auto">
                                {entry.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        ),
        bar: (
            <div className="flex items-center gap-10">
                <ResponsiveContainer width="80%" height={350}>
                    <BarChart data={data} {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" activeBar={<Rectangle strokeWidth={2} />}>
                            {data.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={colors[index % colors.length]}
                                    stroke={colors[index % colors.length]}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <div className="w-[350px] px-4 py-2">
                    {data.map((entry: { name: string; value: number }, index: number) => (
                        <div key={index} className="flex items-center mb-2">
                            <div
                                className="w-4 h-4 rounded-full mr-2"
                                style={{ backgroundColor: colors[index % colors.length] }}
                            />
                            <span className="text-sm font-medium" title={entry.name}>
                                {truncateText(removeEmojis(entry.name), 30)}
                            </span>
                            <span className="text-sm font-semibold ml-auto">
                                {entry.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        ),
        line: (
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={data} {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="name"
                        fontSize="12px"
                        height={60}
                        tickFormatter={(value) => truncateText(removeEmojis(value), 25)}
                        dy={10}
                    />
                    <YAxis />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={colors[0]}
                        activeDot={{ r: 8 }}
                        dot={{ r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        ),
        area: (
            <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={data} {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="name"
                        fontSize="12px"
                        height={60}
                        tickFormatter={(value) => truncateText(removeEmojis(value), 25)}
                        dy={10}
                    />
                    <YAxis />
                    <Tooltip />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={colors[0]}
                        fill={colors[0]}
                        fillOpacity={0.4}
                    />
                </AreaChart>
            </ResponsiveContainer>
        ),
        scatter: (
            <ResponsiveContainer width="100%" height={350}>
                <ScatterChart {...commonProps}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="name"
                        fontSize="12px"
                        height={60}
                        tickFormatter={(value) => truncateText(removeEmojis(value), 25)}
                        dy={10}
                    />
                    <YAxis />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter
                        name="A school"
                        data={data}
                        dataKey="value"
                        fill={colors[0]}
                    />
                </ScatterChart>
            </ResponsiveContainer>
        ),
        radar: (
            <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={data}>
                    <PolarGrid />
                    <PolarAngleAxis
                        dataKey="name"
                        tickFormatter={(value) => truncateText(removeEmojis(value), 50)}
                    />
                    <PolarRadiusAxis />
                    <Radar
                        name="Radar"
                        dataKey="value"
                        stroke={colors[0]}
                        fill={colors[0]}
                        fillOpacity={0.6}
                    />
                    <Tooltip />
                </RadarChart>
            </ResponsiveContainer>
        ),
        radial: (
            <div className="flex items-center">
                <ResponsiveContainer width="100%" height={450}>
                    <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="10%"
                        outerRadius="80%"
                        barSize={10}
                        data={data.map((item, index) => ({
                            ...item,
                            fill: colors[index % colors.length],
                        }))}
                    >
                        <RadialBar
                            minAngle={15}
                            label={{ position: 'insideStart', fill: '#fff' }}
                            background
                            clockWise
                            dataKey="value"
                        />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="w-[350px] px-4 py-2">
                    {data.map((entry: { name: string; value: number }, index: number) => (
                        <div key={index} className="flex items-center mb-2">
                            <div
                                className="w-4 h-4 rounded-full mr-2"
                                style={{ backgroundColor: colors[index % colors.length] }}
                            />
                            <span className="text-sm font-medium" title={entry.name}>
                                {truncateText(removeEmojis(entry.name), 30)}
                            </span>
                            <span className="text-sm font-semibold ml-auto">
                                {entry.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        ),
        wordCloud: (
            <div className="flex items-center justify-center w-full h-full">
                <ResponsiveContainer width="100%" height={450}>
                    <WordCloud
                        data={data
                            .map((item) => ({
                                text: removeEmojis(item.name),
                                value: item.value,
                            }))
                            .sort((a, b) => b.value - a.value)}
                        font="Arial"
                        fontStyle="normal"
                        fontWeight="bold"
                        fontSize={fontSize}
                        spiral="archimedean"
                        rotate={0}
                        padding={2}
                        random={() => 0.5} 
                        fill={fill}
                    />
                </ResponsiveContainer>
            </div>
        ),
    };
    return chartConfigs[typeChart as keyof typeof chartConfigs] || chartConfigs.pie;
};

export default Charts;