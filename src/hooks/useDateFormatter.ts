import { useCallback } from "react";

type DateFormatOptions = {
  locale?: string;
  dateStyle?: "full" | "long" | "medium" | "short";
  timeStyle?: "full" | "long" | "medium" | "short";
  options?: Intl.DateTimeFormatOptions;
  format?: "dd/mm/yy" | "dd/mm/yyyy" | "dd mmm, yyyy";
};

const useDateFormatter = () => {
  /**
   * Pads numbers to two digits
   */
  const formatTwoDigits = useCallback((num: number): string => {
    return String(num).padStart(2, "0");
  }, []);

  /**
   * Format date based on standard or custom formats
   */
  const formatDate = useCallback(
    (
      date: Date | string | number,
      {
        locale = "en-US",
        dateStyle = "medium",
        timeStyle,
        options,
        format,
      }: DateFormatOptions = {}
    ): string => {
      try {
        const d = new Date(date);

        const day = formatTwoDigits(d.getDate());
        const month = formatTwoDigits(d.getMonth() + 1);
        const yearFull = d.getFullYear();
        const yearShort = String(yearFull).slice(-2);
        const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthName = monthNamesShort[d.getMonth()];

        // Custom string formats
        if (format === "dd/mm/yy") {
          return `${day}/${month}/${yearShort}`;
        }

        if (format === "dd/mm/yyyy") {
          return `${day}/${month}/${yearFull}`;
        }

        if (format === "dd mmm, yyyy") {
          return `${day} ${monthName}, ${yearFull}`;
        }

        // Default Intl formatting
        const formatter = new Intl.DateTimeFormat(locale, {
          ...(options || {}),
          ...(dateStyle ? { dateStyle } : {}),
          ...(timeStyle ? { timeStyle } : {}),
        });

        return formatter.format(d);
      } catch (error) {
        console.warn("Date formatting failed:", error);
        return "";
      }
    },
    [formatTwoDigits]
  );

  return {
    formatDate,
    formatTwoDigits,
  };
};

export default useDateFormatter;

// Example Usage in a Component
// <p>Full Date: {formatDate(now, { dateStyle: "full" })}</p>
// <p>Short Date: {formatDate(now, { dateStyle: "short" })}</p>
// <p>Time Only: {formatDate(now, { timeStyle: "short" })}</p>
// <p>Date & Time: {formatDate(now, { dateStyle: "medium", timeStyle: "short" })}</p>
// <p>Custom (DD-MM-YYYY): {`${formatTwoDigits(now.getDate())}-${formatTwoDigits(now.getMonth() + 1)}-${now.getFullYear()}`}</p>
//<p>dd/mm/yy: {formatDate(now, { format: "dd/mm/yy" })}</p>
//<p>dd/mm/yyyy: {formatDate(now, { format: "dd/mm/yyyy" })}</p>
//<p>dd mmm, yyyy: {formatDate(now, { format: "dd mmm, yyyy" })}</p>
//<p>Intl full date: {formatDate(now, { dateStyle: "full" })}</p>