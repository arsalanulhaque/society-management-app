import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Calendar } from "./Calendar"; // your existing calendar component
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
    value?: Date;
    onChange: (date: Date | undefined) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    placeholder = "Pick a date",
    className,
    disabled = false,
}) => {
    const formatted = value ? format(value, "PPP") : placeholder;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div
                    className={cn(
                        "w-full cursor-pointer border rounded-md px-3 py-2 text-sm flex items-center justify-between",
                        disabled && "opacity-50 pointer-events-none",
                        className
                    )}
                >
                    <span>{formatted}</span>
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={onChange}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
};
