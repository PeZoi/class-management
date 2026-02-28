"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Label } from '@/components/ui/label';
import { parse } from "date-fns"

interface DatePickerRangeProps {
  label: string
  className?: string
  placeholder?: string
  startDate?: string
  endDate?: string
  onChangeValue?: (value: { startDate: string, endDate: string }) => void
}

export function DatePickerRange({
  label,
  placeholder,
  className,
  startDate,
  endDate,
  onChangeValue,
}: DatePickerRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(undefined)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (startDate && endDate) {
      try {
        setDate({ from: parse(startDate, "dd/MM/yyyy", new Date()), to: parse(endDate, "dd/MM/yyyy", new Date()) })
      } catch {
        // Invalid date format, reset to undefined
        setDate(undefined)
      }
    } else {
      // Reset khi không có cả startDate và endDate
      setDate(undefined)
    }
  }, [startDate, endDate])

  return (
    <div className={cn("relative min-w-[200px]", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            {/* Button */}
            <Button
              variant="outline"
              className={cn(
                "w-full h-9 justify-start text-xs font-normal px-3 pt-3.5 pb-1.5",
                open && "ring-2 ring-primary border-primary"
              )}
            >
              <CalendarIcon className={`mr-1.5 text-xs`} />

              {date?.from && date.to ? (
                date.to ? (
                  <>
                    {format(date?.from, "dd/MM/yyyy")} -{" "}
                    {format(date?.to, "dd/MM/yyyy")}
                  </>
                ) : (
                  format(date?.from, "dd/MM/yyyy")
                )
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-200">
                  {placeholder}
                </span>
              )}
            </Button>

            {/* Floating Label */}
            <Label
              className={cn(
                "pointer-events-none absolute z-10 text-slate-500 dark:text-slate-400 transition-all duration-200 ease-in-out top-0 -translate-y-1/2 text-[10px] font-medium leading-tight px-1.5 bg-white dark:bg-slate-900 ml-3"
              )}
            >
              {label}
            </Label>
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(_date) => {
              console.log('date', _date);
              if (_date) {
                setDate(_date)
                onChangeValue?.({ startDate: format(_date.from as Date, "dd/MM/yyyy") || '', endDate: format(_date.to as Date, "dd/MM/yyyy") || '' })
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}