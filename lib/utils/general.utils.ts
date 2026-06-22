export const generateId = (): string => {
  return crypto.randomUUID();
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return "An unknown error occurred";
};

export const hoursToMinutes = (hours: number): number => Math.round(hours * 60);
export const minutesToHours = (minutes: number): number => minutes / 60;

export const convertCentsToCurrency = (cents: number): string => {
  return (cents / 100).toFixed(2);
};



export const generateRandomColor = (): string =>
  "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");

export const formatCurrency = (cents: number): string =>
  (cents / 100).toFixed(2) + " €";