function escapeCsvField(value: string | number): string {
  const str = String(value);
  // Option text is free-form (up to 120 chars) and could contain commas,
  // quotes, or newlines — quote-and-escape whenever any of those appear,
  // otherwise leave it bare.
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv(rows: Record<string, string | number>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]!);
  const lines = [
    headers.map(escapeCsvField).join(","),
    ...rows.map((row) => headers.map((h) => escapeCsvField(row[h]!)).join(",")),
  ];
  return lines.join("\r\n");
}
