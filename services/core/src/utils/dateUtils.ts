export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export const getDaysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return formatDate(d);
};

export const iterateDates = (count: number): string[] => {
  const dates: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    dates.push(getDaysAgo(i));
  }
  return dates;
};
