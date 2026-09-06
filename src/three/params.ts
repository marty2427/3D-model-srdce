import { createContext, useContext, useMemo } from 'react'
import { useStore } from '../store'
import { defaultParams, getHeartParams, type HeartParams } from '../lib/pathology'

export const ParamsContext = createContext<HeartParams>(defaultParams)
export const useParams = () => useContext(ParamsContext)

/** Parametry modelu odvozené ze stavu aplikace (memoizované). */
export function useHeartParams(): HeartParams {
  const mode = useStore((s) => s.mode)
  const disease = useStore((s) => s.disease)
  const infarctStep = useStore((s) => s.infarctStep)
  const treatment = useStore((s) => s.treatment)
  const treatmentStep = useStore((s) => s.treatmentStep)
  return useMemo(
    () => getHeartParams({ mode, disease, infarctStep, treatment, treatmentStep }),
    [mode, disease, infarctStep, treatment, treatmentStep],
  )
}
