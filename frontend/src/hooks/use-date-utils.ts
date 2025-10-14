import { useMemo, useCallback, useState } from 'react'
import {
  format,
  formatDistance,
  formatRelative,
  isAfter,
  isBefore,
  isEqual,
  parseISO,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  isValid,
  isToday,
  isTomorrow,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,
} from 'date-fns'

export interface DateRange {
  start: Date
  end: Date
}

export interface UseDateUtilsOptions {
  locale?: Locale
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  defaultFormat?: string
}

/**
 * Comprehensive date utilities hook using date-fns
 */
export function useDateUtils(options: UseDateUtilsOptions = {}) {
  const {
    locale,
    weekStartsOn = 1, // Monday
    defaultFormat = 'MMM dd, yyyy',
  } = options

  // Date parsing and validation
  const parseDate = useCallback((date: Date | string): Date => {
    if (typeof date === 'string') {
      return parseISO(date)
    }
    return date
  }, [])

  // Formatting functions
  const formatters = useMemo(() => ({
    // Standard formats
    short: (date: Date | string) => format(parseDate(date), 'MM/dd/yyyy'),
    medium: (date: Date | string) => format(parseDate(date), defaultFormat),
    long: (date: Date | string) => format(parseDate(date), 'EEEE, MMMM dd, yyyy'),
    time: (date: Date | string) => format(parseDate(date), 'h:mm a'),
    dateTime: (date: Date | string) => format(parseDate(date), 'MMM dd, yyyy h:mm a'),
    iso: (date: Date | string) => format(parseDate(date), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
    
    // Relative formats
    relative: (date: Date | string) => formatRelative(parseDate(date), new Date(), locale ? { locale } : {}),
    distance: (date: Date | string, baseDate?: Date) => 
      formatDistance(parseDate(date), baseDate || new Date(), { addSuffix: true, ...(locale ? { locale } : {}) }),
    
    // Custom format
    custom: (date: Date | string, formatString: string) => 
      format(parseDate(date), formatString, locale ? { locale } : {}),
  }), [locale, defaultFormat, parseDate])

  const isValidDate = useCallback((date: Date | string): boolean => {
    try {
      return isValid(parseDate(date))
    } catch {
      return false
    }
  }, [parseDate])

  // Date comparisons
  const comparisons = useMemo(() => ({
    isAfter: (date1: Date | string, date2: Date | string) => 
      isAfter(parseDate(date1), parseDate(date2)),
    isBefore: (date1: Date | string, date2: Date | string) => 
      isBefore(parseDate(date1), parseDate(date2)),
    isEqual: (date1: Date | string, date2: Date | string) => 
      isEqual(parseDate(date1), parseDate(date2)),
    isSameDay: (date1: Date | string, date2: Date | string) => 
      isEqual(startOfDay(parseDate(date1)), startOfDay(parseDate(date2))),
  }), [parseDate])

  // Date calculations
  const calculations = useMemo(() => ({
    addDays: (date: Date | string, amount: number) => addDays(parseDate(date), amount),
    addWeeks: (date: Date | string, amount: number) => addWeeks(parseDate(date), amount),
    addMonths: (date: Date | string, amount: number) => addMonths(parseDate(date), amount),
    subDays: (date: Date | string, amount: number) => subDays(parseDate(date), amount),
    subWeeks: (date: Date | string, amount: number) => subWeeks(parseDate(date), amount),
    subMonths: (date: Date | string, amount: number) => subMonths(parseDate(date), amount),
    
    differenceInDays: (date1: Date | string, date2: Date | string) => 
      differenceInDays(parseDate(date1), parseDate(date2)),
    differenceInHours: (date1: Date | string, date2: Date | string) => 
      differenceInHours(parseDate(date1), parseDate(date2)),
    differenceInMinutes: (date1: Date | string, date2: Date | string) => 
      differenceInMinutes(parseDate(date1), parseDate(date2)),
  }), [parseDate])

  // Date ranges
  const ranges = useMemo(() => ({
    today: (): DateRange => ({
      start: startOfDay(new Date()),
      end: endOfDay(new Date()),
    }),
    yesterday: (): DateRange => {
      const yesterday = subDays(new Date(), 1)
      return {
        start: startOfDay(yesterday),
        end: endOfDay(yesterday),
      }
    },
    thisWeek: (): DateRange => ({
      start: startOfWeek(new Date(), { weekStartsOn }),
      end: endOfWeek(new Date(), { weekStartsOn }),
    }),
    lastWeek: (): DateRange => {
      const lastWeek = subWeeks(new Date(), 1)
      return {
        start: startOfWeek(lastWeek, { weekStartsOn }),
        end: endOfWeek(lastWeek, { weekStartsOn }),
      }
    },
    thisMonth: (): DateRange => ({
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date()),
    }),
    lastMonth: (): DateRange => {
      const lastMonth = subMonths(new Date(), 1)
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth),
      }
    },
    last30Days: (): DateRange => ({
      start: startOfDay(subDays(new Date(), 30)),
      end: endOfDay(new Date()),
    }),
    last90Days: (): DateRange => ({
      start: startOfDay(subDays(new Date(), 90)),
      end: endOfDay(new Date()),
    }),
    custom: (start: Date | string, end: Date | string): DateRange => ({
      start: startOfDay(parseDate(start)),
      end: endOfDay(parseDate(end)),
    }),
  }), [weekStartsOn, parseDate])

  // Date status checks
  const status = useMemo(() => ({
    isToday: (date: Date | string) => isToday(parseDate(date)),
    isTomorrow: (date: Date | string) => isTomorrow(parseDate(date)),
    isYesterday: (date: Date | string) => isYesterday(parseDate(date)),
    isThisWeek: (date: Date | string) => isThisWeek(parseDate(date), { weekStartsOn }),
    isThisMonth: (date: Date | string) => isThisMonth(parseDate(date)),
    isThisYear: (date: Date | string) => isThisYear(parseDate(date)),
    isPast: (date: Date | string) => isBefore(parseDate(date), new Date()),
    isFuture: (date: Date | string) => isAfter(parseDate(date), new Date()),
    isOverdue: (dueDate: Date | string) => isBefore(parseDate(dueDate), startOfDay(new Date())),
  }), [parseDate, weekStartsOn])

  // Business day calculations
  const businessDays = useMemo(() => ({
    isWeekend: (date: Date | string) => {
      const day = parseDate(date).getDay()
      return day === 0 || day === 6 // Sunday or Saturday
    },
    isBusinessDay: (date: Date | string) => {
      const day = parseDate(date).getDay()
      return day >= 1 && day <= 5 // Monday to Friday
    },
    addBusinessDays: (date: Date | string, days: number) => {
      let result = parseDate(date)
      let remainingDays = days
      
      while (remainingDays > 0) {
        result = addDays(result, 1)
        if (businessDays.isBusinessDay(result)) {
          remainingDays--
        }
      }
      
      return result
    },
    getBusinessDaysInRange: (start: Date | string, end: Date | string) => {
      const startDate = parseDate(start)
      const endDate = parseDate(end)
      let count = 0
      let current = startDate
      
      while (isBefore(current, endDate) || isEqual(current, endDate)) {
        if (businessDays.isBusinessDay(current)) {
          count++
        }
        current = addDays(current, 1)
      }
      
      return count
    },
  }), [parseDate])

  // Due date utilities for surveys and tasks
  const dueDates = useMemo(() => ({
    calculateDueDate: (
      startDate: Date | string,
      dueDays: number,
      businessDaysOnly = false
    ) => {
      const start = parseDate(startDate)
      return businessDaysOnly 
        ? businessDays.addBusinessDays(start, dueDays)
        : addDays(start, dueDays)
    },
    
    getDueDateStatus: (dueDate: Date | string) => {
      const due = parseDate(dueDate)
      const now = new Date()
      const daysUntilDue = differenceInDays(due, startOfDay(now))
      
      if (daysUntilDue < 0) return 'overdue'
      if (daysUntilDue === 0) return 'due-today'
      if (daysUntilDue === 1) return 'due-tomorrow'
      if (daysUntilDue <= 3) return 'due-soon'
      if (daysUntilDue <= 7) return 'due-this-week'
      return 'due-later'
    },
    
    getDueDateColor: (dueDate: Date | string) => {
      const status = dueDates.getDueDateStatus(dueDate)
      const colors = {
        'overdue': 'text-red-600 bg-red-50',
        'due-today': 'text-orange-600 bg-orange-50',
        'due-tomorrow': 'text-yellow-600 bg-yellow-50',
        'due-soon': 'text-blue-600 bg-blue-50',
        'due-this-week': 'text-gray-600 bg-gray-50',
        'due-later': 'text-gray-500 bg-gray-25',
      }
      return colors[status] || colors['due-later']
    },
  }), [parseDate, businessDays])

  return {
    format: formatters,
    parse: parseDate,
    isValid: isValidDate,
    compare: comparisons,
    calculate: calculations,
    ranges,
    status,
    businessDays,
    dueDates,
  }
}

/**
 * Hook for managing date ranges with validation
 */
export function useDateRange(initialRange?: DateRange) {
  const [range, setRange] = useState<DateRange | undefined>(initialRange)
  const { compare, ranges } = useDateUtils()

  const setDateRange = useCallback((newRange: DateRange | undefined) => {
    if (!newRange) {
      setRange(undefined)
      return
    }

    // Ensure start is before or equal to end
    if (compare.isAfter(newRange.start, newRange.end)) {
      setRange({
        start: newRange.end,
        end: newRange.start,
      })
    } else {
      setRange(newRange)
    }
  }, [compare])

  const setPresetRange = useCallback((preset: keyof typeof ranges) => {
    if (preset === 'custom') return
    setRange(ranges[preset]())
  }, [ranges])

  const clearRange = useCallback(() => {
    setRange(undefined)
  }, [])

  const isValidRange = useMemo(() => {
    if (!range) return false
    return compare.isBefore(range.start, range.end) || compare.isEqual(range.start, range.end)
  }, [range, compare])

  return {
    range,
    setRange: setDateRange,
    setPresetRange,
    clearRange,
    isValid: isValidRange,
  }
}