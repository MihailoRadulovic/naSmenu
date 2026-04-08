'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface Features {
  salaryCalc: boolean
  printSchedule: boolean
  holidays: boolean
  absenceTypes: boolean
  employeeNotes: boolean
  copyWeek: boolean
  charts: boolean
}

const DEFAULT: Features = {
  salaryCalc: true,
  printSchedule: true,
  holidays: true,
  absenceTypes: true,
  employeeNotes: true,
  copyWeek: true,
  charts: true,
}

interface FeaturesCtx {
  features: Features
  updateFeature: (key: keyof Features, value: boolean) => void
}

const Ctx = createContext<FeaturesCtx>({ features: DEFAULT, updateFeature: () => {} })

export function FeaturesProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const [features, setFeatures] = useState<Features>(DEFAULT)

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!json?.data) return
        setFeatures({
          salaryCalc: json.data.featureSalary ?? false,
          printSchedule: json.data.featurePrint ?? false,
          holidays: json.data.featureHolidays ?? false,
          absenceTypes: json.data.featureAbsence ?? false,
          employeeNotes: json.data.featureNotes ?? false,
          copyWeek: json.data.featureCopyWeek ?? false,
          charts: json.data.featureCharts ?? false,
        })
      })
      .catch(() => {})
  }, [status])

  function updateFeature(key: keyof Features, value: boolean) {
    setFeatures((prev) => ({ ...prev, [key]: value }))
  }

  return <Ctx.Provider value={{ features, updateFeature }}>{children}</Ctx.Provider>
}

export function useFeatures() {
  return useContext(Ctx).features
}

export function useFeaturesContext() {
  return useContext(Ctx)
}
