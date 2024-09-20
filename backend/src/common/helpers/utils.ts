import { differenceInYears } from 'date-fns';
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

export const isOver16FromCNP = (cnp: string): boolean => {
  // we don't need to perform the calculation before the user has entered all the necessary digits to calculate
  if (!cnp) {
    throw new Error('CNP is required');
  }
  if (cnp.length !== 13) {
    throw new Error('CNP must be 13 digits long');
  }
  // if first digit is above 5, then the birth year is 2000+
  const yearPrefix = parseInt(cnp[0], 10) < 5 ? '19' : '20';
  const year = (yearPrefix + cnp.substring(1, 3)).toString();
  const month = cnp.substring(3, 5);
  const day = cnp.substring(5, 7);
  const birthday = new Date(`${year}-${month}-${day}`);

  const age = differenceInYears(new Date(), birthday);
  return age >= 16;
};
