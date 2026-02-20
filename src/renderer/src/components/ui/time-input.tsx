import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseHumanToSeconds, formatSecondsToHuman } from "@/lib/time";
import { cn } from "@/lib/utils";

interface TimeInputProps {
  label: string;
  value: number; // In seconds
  onChange: (seconds: number) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  description?: string;
}

export function TimeInput({ label, value, onChange, placeholder, className, id, description }: TimeInputProps) {
  // We keep a local string state for the user to type freely (e.g., "1h 30")
  const [inputValue, setInputValue] = useState("");
  
  // Sync local string with the external seconds value ONLY on initial load or if value changes externally
  useEffect(() => {
    if (value > 0) {
      const formatted = formatSecondsToHuman(value);
      // Only update if it's actually different from what's currently parsed
      if (parseHumanToSeconds(inputValue) !== value) {
        setInputValue(formatted);
      }
    } else {
      setInputValue("");
    }
  }, [value]);

  const parsedSeconds = parseHumanToSeconds(inputValue);
  const isValid = !inputValue.trim() || parsedSeconds > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setInputValue(newVal);
    
    const seconds = parseHumanToSeconds(newVal);
    // If the string is empty, we return 0. If it's valid, we return the parsed seconds.
    if (newVal === "") {
      onChange(0);
    } else if (seconds >= 0) {
      onChange(seconds);
    }
  };

  const handleBlur = () => {
    if (parsedSeconds > 0) {
      setInputValue(formatSecondsToHuman(parsedSeconds));
    } else if (inputValue.trim() === "") {
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id} className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          {label}
        </Label>
        {description && (
          <p className="text-[9px] text-zinc-400 font-medium leading-tight">
            {description}
          </p>
        )}
      </div>
      <div className="relative">
        <Input
          id={id}
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "e.g. 1h 30, 45m, 90"}
          className={cn(
            "h-10 text-sm font-bold border-zinc-200 focus-visible:ring-zinc-900 pr-16",
            !isValid && "border-red-500 focus-visible:ring-red-500"
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {parsedSeconds > 0 && (
            <span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-100">
              {formatSecondsToHuman(parsedSeconds)}
            </span>
          )}
        </div>
      </div>
      {!isValid && (
        <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">
          Invalid time format
        </p>
      )}
    </div>
  );
}
