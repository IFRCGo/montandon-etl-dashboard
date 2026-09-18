export const STATUS_COLORS: Record<string, string> = {
    FAILED: '#D03B3B',
    IN_PROGRESS: '#2A78D6',
    PENDING: '#FAB219',
    SUCCESS: '#0CA30C',
    ON_RETRY: '#4A3AA7',
};

const STATUS_CODE_LABELS: Record<number, string> = {
    1: 'PENDING',
    2: 'IN_PROGRESS',
    3: 'SUCCESS',
    4: 'FAILED',
    5: 'ON_RETRY',
};

export const STATUS_LABELS: Record<string, string> = {
    FAILED: 'Failed',
    IN_PROGRESS: 'In progress',
    PENDING: 'Pending',
    SUCCESS: 'Success',
    ON_RETRY: 'On Retry',
};

export interface TrendRow {
    date: string;
    [status: string]: string | number;
}

export function pivotTrendByDate(
    rows: { date: string; status: string; count: number }[] | undefined,
): TrendRow[] {
    if (!rows) {
        return [];
    }

    const byDate = new Map<string, TrendRow>();
    rows.forEach((row) => {
        const existing = byDate.get(row.date) ?? { date: row.date };
        existing[row.status] = row.count;
        byDate.set(row.date, existing);
    });

    return Array.from(byDate.values()).sort(
        (a, b) => a.date.localeCompare(b.date),
    );
}

export function pivotSnapshotTrend(
    rows: { createdAt: string; status: number; count: number }[] | undefined,
): TrendRow[] {
    if (!rows) {
        return [];
    }

    // Rows from the same snapshot run land microseconds apart (bulk_create
    // timestamps each row individually), so round down to the minute both
    // to group them into one point and to keep the axis/tooltip readable.
    const bySnapshot = new Map<string, TrendRow>();
    rows.forEach((row) => {
        const bucket = row.createdAt.slice(0, 16);
        const label = STATUS_CODE_LABELS[row.status] ?? String(row.status);
        const existing = bySnapshot.get(bucket) ?? { date: bucket };
        existing[label] = (Number(existing[label]) || 0) + row.count;
        bySnapshot.set(bucket, existing);
    });

    return Array.from(bySnapshot.values()).sort(
        (a, b) => a.date.localeCompare(b.date),
    );
}

export function formatTrendDate(value: string): string {
    const parsed = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    if (value.length <= 10) {
        return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }

    return parsed.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}
