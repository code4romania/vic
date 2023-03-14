import * as XLSX from 'xlsx';

export function JSONStringifyError(value: Error): string {
  if (value instanceof Error) {
    const error: Record<string, unknown> = {};

    Object.getOwnPropertyNames(value).forEach(function (propName) {
      error[propName as keyof Error] = value[propName as keyof Error];
    });

    return JSON.stringify(error);
  }

  return JSON.stringify(value);
}

export function jsonToExcelBuffer<T>(
  jsonData: T[],
  outputFileName: string,
): XLSX.BookType {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(jsonData);

  XLSX.utils.book_append_sheet(wb, ws, outputFileName);

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
