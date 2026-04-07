export const features = {
  salaryCalc:    process.env.NEXT_PUBLIC_FEATURE_SALARY    === 'true',
  printSchedule: process.env.NEXT_PUBLIC_FEATURE_PRINT     === 'true',
  holidays:      process.env.NEXT_PUBLIC_FEATURE_HOLIDAYS  === 'true',
  absenceTypes:  process.env.NEXT_PUBLIC_FEATURE_ABSENCE   === 'true',
  employeeNotes: process.env.NEXT_PUBLIC_FEATURE_NOTES     === 'true',
  darkMode:      process.env.NEXT_PUBLIC_FEATURE_DARK_MODE === 'true',
  copyWeek:      process.env.NEXT_PUBLIC_FEATURE_COPY_WEEK === 'true',
} as const
