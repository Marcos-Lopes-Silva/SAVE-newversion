import {
    PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart,
    Line, AreaChart, Area, Rectangle, ScatterChart, Scatter, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, RadialBarChart, RadialBar
} from "recharts";
import { ResponsiveContainer } from 'recharts';
import React, { useCallback } from 'react';
import WordCloud from "react-d3-cloud";
import useDeviceType from "../../lib/hooks/Device";

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
    const isDesktop = useDeviceType();

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
        (word: { text: string; value: number }, isDesktop: boolean): number => {
            const values = data.map((item) => item.value);
            const maxValue = Math.max(...values);

            const maxWord = data.reduce((prev, curr) =>
                curr.value > prev.value ? curr : prev
            ).name;
            const maxWordLength = maxWord.length;

            const containerWidth = isDesktop ? 1536 : window.innerWidth * 0.9; 
            const containerHeight = isDesktop ? 600 : 350;

            const maxFontSize = Math.min(
                containerWidth / maxWordLength,
                containerHeight * (isDesktop ? 0.9 : 1.0) 
            ); 
            const scale = (value: number) => value / maxValue;

            const minFontSize = Math.max(maxFontSize * 0.15, 12);

            const calculatedFontSize =
                minFontSize + (maxFontSize - minFontSize) * scale(word.value);

            return word.value === maxValue ? maxFontSize : calculatedFontSize;
        },
        [data]
    );

    const fill = useCallback((_: any, i: number) => colors[i % colors.length], [colors]);

    const calculateTruncateLength = (data: any[], containerWidth: number, isDesktop: boolean): number => {
        const totalWords = data.length;
        const totalLetters = data.reduce((sum, item) => sum + item.name.length, 0);
        const averageWordLength = totalLetters / totalWords;

        if (isDesktop) {
            const availableSpace = containerWidth - 100; 
            const truncateLength = Math.min(
                Math.floor(availableSpace / (totalWords * averageWordLength * 1.5)),
                averageWordLength * 3 
            );
            return Math.max(truncateLength, 12);
        } else {
            const availableSpace = containerWidth - 50;
            const truncateLength = Math.min(
                Math.floor(availableSpace / (totalWords * averageWordLength * 1.2)), 
                averageWordLength * 2.5 
            );
            return Math.max(truncateLength, 8);
        }
    };

    const chartConfigs = {
        pie: (
            <div className="flex flex-row items-center gap-8">
                {isDesktop ? (
                    <>
                        <ResponsiveContainer width="100%" height={380}>
                            <PieChart {...commonProps}>
                                <Pie
                                    data={data}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={4}
                                >
                                    {data.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="w-[450px] px-4 py-2">
                            {data.map((entry: { name: string; value: number }, index: number) => (
                                <div key={index} className="flex items-center mb-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                    <div
                                        className="w-4 h-4 rounded-full mr-2"
                                        style={{ backgroundColor: colors[index % colors.length] }}
                                    />
                                    <span className="text-sm font-medium" title={entry.name}>
                                        {truncateText(removeEmojis(entry.name), 20)}
                                    </span>
                                    <span className="text-sm font-semibold ml-auto">
                                        {entry.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-6 -mt-2 w-full">
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart {...commonProps}>
                                <Pie
                                    data={data}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={30}
                                    outerRadius={50}
                                    paddingAngle={4}
                                >
                                    {data.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="w-[200px] px-2 -ml-5 max-h-[200px]">
                            {data.map((entry: { name: string; value: number }, index: number) => (
                                <div key={index} className="flex items-center mb-2 gap-1 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                    <div
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: colors[index % colors.length] }}
                                    />
                                    <span className="text-xs font-medium" title={entry.name} onClick={() => alert(entry.name)}>
                                        {truncateText(removeEmojis(entry.name), 10)}
                                    </span>
                                    <span className="text-xs font-semibold ml-auto">
                                        {entry.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        ),
        bar: (
            <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-10">
                {isDesktop ? (
                    <>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={data} {...commonProps}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" barSize={200} activeBar={<Rectangle strokeWidth={2} />}>
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
                                <div key={index} className="flex items-center mb-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                    <div
                                        className="w-4 h-4 rounded-full mr-2"
                                        style={{ backgroundColor: colors[index % colors.length] }}
                                    />
                                    <span className="text-sm font-medium" title={entry.name}>
                                        {truncateText(removeEmojis(entry.name), 20)}
                                    </span>
                                    <span className="text-sm font-semibold ml-auto">
                                        {entry.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex flex-row items-center mt-5">
                            <ResponsiveContainer width="100%" height={210}>
                                {(() => {
                                    const totalWidth = 101;
                                    const totalBars = data.length; 
                                    const availableSpace = totalWidth - 10; 
                                    const barSize = Math.max(availableSpace / (totalBars * 1.5), 5); 
                                    const barCategoryGap = `${Math.min((availableSpace / totalBars) * 0.5, 20)}%`; 

                                    return (
                                        <BarChart data={data} barCategoryGap={barCategoryGap} {...commonProps} className="-ml-8">
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <YAxis />
                                            <XAxis dataKey="name" className="hidden" />
                                            <Tooltip labelClassName="text-balance" />
                                            <Bar dataKey="value" barSize={barSize} activeBar={<Rectangle strokeWidth={10} />}>
                                                {data.map((_, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={colors[index % colors.length]}
                                                        stroke={colors[index % colors.length]}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    );
                                })()}
                            </ResponsiveContainer>
                            <div className="w-[210px] px-6 py-2 overflow-y-scroll -ml-10 max-h-[200px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                {data.map((entry: { name: string; value: number }, index: number) => (
                                    <div key={index} className="flex items-center mb-2 gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full mr-1"
                                            style={{ backgroundColor: colors[index % colors.length] }}
                                        />
                                        <span className="text-xs font-medium" title={entry.name}>
                                            {truncateText(removeEmojis(entry.name), calculateTruncateLength(data, window.innerWidth * 0.85, false))}
                                        </span>
                                        <span className="text-xs font-semibold ml-auto">
                                            {entry.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        ),
        line: (
            <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-10">
                {isDesktop ? (
                    <>
                        <ResponsiveContainer width="100%" minWidth="1010px" height={350} style={{ marginLeft: "-2%" }}>
                            <LineChart data={data} {...commonProps}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    fontSize="10px"
                                    height={50}
                                    tickFormatter={(value) =>
                                        truncateText(removeEmojis(value), calculateTruncateLength(data, 1010, isDesktop))
                                    }
                                    dy={10}
                                />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke={colors[0]}
                                    activeDot={{ r: 6 }}
                                    dot={{ r: 3 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </>
                ) : (
                    <ResponsiveContainer width="100%" height={180} minWidth="370px" className="mt-3">
                        <LineChart data={data} {...commonProps} className="-ml-5">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                fontSize="10px"
                                height={50}
                                tickFormatter={(value) =>
                                    truncateText(removeEmojis(value), calculateTruncateLength(data, window.innerWidth * 0.85, false))
                                }
                                dy={10}
                            />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke={colors[0]}
                                activeDot={{ r: 6 }}
                                dot={{ r: 3 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        ),
        area: (
            <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-10">
                {isDesktop ? (
                    <ResponsiveContainer width="100%" minWidth="1010px" height={300} style={{ marginLeft: "-2%" }}>
                        <AreaChart data={data} {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                fontSize="10px"
                                height={50}
                                tickFormatter={(value) => truncateText(removeEmojis(value), calculateTruncateLength(data, window.innerWidth * 0.85, isDesktop))}
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
                ) : (
                    <ResponsiveContainer width="100%" height={200} minWidth="370px" className="mt-3">
                        <AreaChart data={data} {...commonProps} className="-ml-5">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                fontSize="10px"
                                height={50}
                                tickFormatter={(value) => truncateText(removeEmojis(value), calculateTruncateLength(data, window.innerWidth * 0.85, false))}
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
                )}
            </div>
        ),
        scatter: (
            <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-10">
                {isDesktop ? (
                    <ResponsiveContainer width="100%" height={350} minWidth="1010px">   
                        <ScatterChart {...commonProps} className="-ml-5">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                fontSize="12px"
                                height={60}
                                tickFormatter={(value) => truncateText(removeEmojis(value), calculateTruncateLength(data, 1010, isDesktop))}
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
                ) : (
                    <ResponsiveContainer width="100%" height={220} minWidth={"370px"} className="mt-3">
                        <ScatterChart {...commonProps} className="-ml-5">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                fontSize="12px"
                                height={60}
                                tickFormatter={(value) => truncateText(removeEmojis(value), calculateTruncateLength(data, window.innerWidth * 0.85, false))}
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
                )}
            </div>
        ),
        radar: (
            <>
                {isDesktop ? (
                    <ResponsiveContainer width="100%" height={350}>
                        <RadarChart data={data}>
                            <PolarGrid />
                            <PolarAngleAxis
                                dataKey="name"
                                tickFormatter={(value) => truncateText(removeEmojis(value), 45)}
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
                ) : (
                    <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={data}>
                            <PolarGrid />
                            <PolarAngleAxis
                                dataKey="name"
                                tickFormatter={(value) => truncateText(removeEmojis(value), 11)}
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
                )}
            </>
        ),
        radial: (
            <div className="flex items-center">
                {isDesktop ? (
                    <>
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
                                <div key={index} className="flex items-center mb-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                    </>
                ) : (
                    <div className="flex flex-row items-center gap-4">
                        <ResponsiveContainer width="120%" height={200}>
                            <RadialBarChart
                                cx="50%"
                                cy="50%"
                                innerRadius="5%"
                                outerRadius="100%"
                                barSize={5}
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
                        <div className="w-[350px] px-4 py-2 overflow-y-scroll max-h-[200px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            {data.map((entry: { name: string; value: number }, index: number) => (
                                <div key={index} className="flex items-center mb-2 gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full mr-1"
                                        style={{ backgroundColor: colors[index % colors.length] }}
                                    />
                                    <span className="text-xs font-medium" title={entry.name}>
                                        {truncateText(removeEmojis(entry.name), 15)}
                                    </span>
                                    <span className="text-xs font-semibold ml-auto">
                                        {entry.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        ),
        wordCloud: (
            <div className="flex items-center justify-center w-full h-full">
                {isDesktop ? (
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
                            fontSize={(word) => fontSize(word, isDesktop)} 
                            spiral="archimedean"
                            rotate={0}
                            padding={2}
                            random={() => 0.5}
                            fill={fill}
                        />
                    </ResponsiveContainer>
                ) : (
                    <ResponsiveContainer width="100%" height={215}>
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
                            fontSize={(word) => fontSize(word, false)}
                            spiral="archimedean"
                            rotate={0}
                            padding={2}
                            random={() => 0.5}
                            fill={fill}
                        />
                    </ResponsiveContainer>
                )}
            </div>
        ),
    };
    return chartConfigs[typeChart as keyof typeof chartConfigs] || chartConfigs.pie;
};

export default Charts;