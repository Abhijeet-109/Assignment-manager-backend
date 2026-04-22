const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
        headers.map(h => {
            const val = row[h] === null || row[h] === undefined ? '' : row[h];
            return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
};

module.exports = { convertToCSV };