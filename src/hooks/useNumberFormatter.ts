import { useCallback } from "react";

export type FormatOptions = {
  style?: "decimal" | "currency" | "percent" | "unit" | "compact";
  currency?: string;
  locale?: string;
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
  useGrouping?: boolean;
};

const useNumberFormatter = () => {
  /**
   * Format numbers based on style and locale.
   */
  const formatNumber = useCallback(
    (
      value: number,
      {
        style = "decimal",
        currency,
        locale = "en-US",
        maximumFractionDigits = 2,
        minimumFractionDigits,
        useGrouping = true,
      }: FormatOptions = {}
    ): string => {
      try {
        const formatter = new Intl.NumberFormat(locale, {
          style: style === "compact" ? "decimal" : style,
          currency,
          maximumFractionDigits,
          minimumFractionDigits,
          useGrouping,
          notation: style === "compact" ? "compact" : "standard",
        });

        // Fix percent format: 14.29 => 0.1429
        const adjustedValue = style === "percent" ? value / 100 : value;

        return formatter.format(adjustedValue);
      } catch (error) {
        console.warn("Number formatting failed:", error);
        return value.toString();
      }
    },
    []
  );

  /**
   * Pad single-digit numbers to two-digit strings (e.g., 1 -> "01")
   */
  const formatTwoDigits = useCallback((num: number): string => {
    return String(num).padStart(2, "0");
  }, []);

  return {
    formatNumber,
    formatTwoDigits,
  };
};

export default useNumberFormatter;

// Example Usage in a Component
// <p>Decimal: {formatNumber(1234.56)}</p>
//       <p>Currency (USD): {formatNumber(1234.56, { style: "currency", currency: "USD" })}</p>
//       <p>Percent: {formatNumber(14.29, { style: "percent" })}</p>
//       <p>Compact: {formatNumber(1200000, { style: "compact" })}</p>
//       <p>Two-digit: {formatTwoDigits(5)}</p>