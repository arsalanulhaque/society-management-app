import { useEffect, useState } from "react";

export const useYearDropdown = () => {
  const currentYear = new Date().getFullYear();
  const maxPastYears = 10;

  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const defaultYears = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    // Make sure current year is in the list
    if (!defaultYears.includes(currentYear)) {
      defaultYears.push(currentYear);
    }

    // Sort just in case
    defaultYears.sort((a, b) => a - b);
    setYears(defaultYears);
  }, [currentYear]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;

    // Scroll down → load future years
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setYears((prev) => {
        const max = prev[prev.length - 1];
        return [...prev, max + 1];
      });
    }

    // Scroll up → load past years only up to currentYear - 10
    if (scrollTop <= 10) {
      setYears((prev) => {
        const min = prev[0];
        const nextPast = min - 1;
        const earliestAllowedYear = currentYear - maxPastYears;
        if (nextPast >= earliestAllowedYear) {
          return [nextPast, ...prev];
        }
        return prev; // Do nothing if limit reached
      });
    }
  };

  return {
    years,
    handleScroll,
  };
};
