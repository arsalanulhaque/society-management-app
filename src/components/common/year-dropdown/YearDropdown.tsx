import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
  } from "@/components/ui/select";
  import { useYearDropdown } from "./useYearDropdown";
  
  interface YearDropdownProps {
    value?: number | string;
    onChange: (value: number) => void;
  }
  
  export const YearDropdown: React.FC<YearDropdownProps> = ({ value, onChange }) => {
    const { years, handleScroll } = useYearDropdown();
  
    return (
      <Select
        value={value?.toString()}
        onValueChange={(val) => onChange(parseInt(val))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a Year" />
        </SelectTrigger>
        <SelectContent onWheel={handleScroll} className="max-h-48 overflow-y-auto">
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };
  