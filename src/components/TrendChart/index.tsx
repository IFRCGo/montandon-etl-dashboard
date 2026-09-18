import {
    Button,
    Container,
} from '@ifrc-go/ui';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import {
    formatTrendDate,
    STATUS_COLORS,
    STATUS_LABELS,
    type TrendRow,
} from '#utils/trend';

import styles from './styles.module.css';

export type TrendMode = 'daily' | 'snapshot';

interface Props {
    heading: string;
    mode: TrendMode;
    onModeChange: (mode: TrendMode) => void;
    data: TrendRow[];
    statusKeys: string[];
}

function TrendChart(props: Props) {
    const {
        heading,
        mode,
        onModeChange,
        data,
        statusKeys,
    } = props;

    return (
        <Container
            heading={heading}
            withHeaderBorder
            actions={(
                <>
                    <Button
                        name="daily"
                        variant={mode === 'daily' ? 'primary' : 'secondary'}
                        onClick={onModeChange}
                    >
                        New items per day
                    </Button>
                    <Button
                        name="snapshot"
                        variant={mode === 'snapshot' ? 'primary' : 'secondary'}
                        onClick={onModeChange}
                    >
                        Point-in-time totals
                    </Button>
                </>
            )}
        >
            <ResponsiveContainer
                width="100%"
                height={260}
                className={styles.trendChart}
            >
                <AreaChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatTrendDate} />
                    <YAxis tickFormatter={(value: number) => value.toLocaleString()} />
                    <Tooltip
                        labelFormatter={(label) => (typeof label === 'string' ? formatTrendDate(label) : label)}
                        formatter={(value) => (typeof value === 'number' ? value.toLocaleString() : value)}
                    />
                    <Legend />
                    {statusKeys.map((status) => (
                        <Area
                            key={status}
                            type="monotone"
                            dataKey={status}
                            name={STATUS_LABELS[status] ?? status}
                            stackId="a"
                            stroke={STATUS_COLORS[status] ?? '#898781'}
                            fill={STATUS_COLORS[status] ?? '#898781'}
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        </Container>
    );
}

export default TrendChart;
