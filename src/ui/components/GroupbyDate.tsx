export const groupByDate = (data: any[]) => {
    const grouped: Record<string, any[]> = {};

    data.forEach(item => {
        const date = new Date(item.createdAt)
            .toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            })
            .toUpperCase();

        if (!grouped[date]) {
            grouped[date] = [];
        }

        grouped[date].push(item);
    });

    return Object.entries(grouped).map(([date, transactions]) => ({
        date,
        transactions,
    }));
};