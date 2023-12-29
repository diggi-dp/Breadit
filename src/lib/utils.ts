import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNowStrict } from 'date-fns'
import locale from 'date-fns/locale/en-US'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const formatDistanceLocale = {
  lessThanXSeconds: 'just now',
  xSeconds: 'just now',
  halfAMinute: 'just now',
  lessThanXMinutes: '{{count}} minute',
  xMinutes: '{{count}} minute',
  aboutXHours: '{{count}} hour',
  xHours: '{{count}} hour',
  xDays: '{{count}} day',
  aboutXWeeks: '{{count}} week',
  xWeeks: '{{count}} week',
  aboutXMonths: '{{count}} month',
  xMonths: '{{count}} month',
  aboutXYears: '{{count}} year',
  xYears: '{{count}} year',
  overXYears: '{{count}} year',
  almostXYears: '{{count}} year',
};


function formatDistance(token: string, count: number, options?: any): string {
  options = options || {}

  const result = formatDistanceLocale[
    token as keyof typeof formatDistanceLocale
  ].replace('{{count}}', count.toString())

  if (options.addSuffix) {
    if (options.comparison > 0) {
      return 'in ' + result
    } else {
      if (result === 'just now') return result
      return result + ' ago'
    }
  }

  return result
}

export function formatTimeToNow(date: Date): string {
  return formatDistanceToNowStrict(date, {
    addSuffix: true,
    locale: {
      ...locale,
      formatDistance,
    },
  })
}
