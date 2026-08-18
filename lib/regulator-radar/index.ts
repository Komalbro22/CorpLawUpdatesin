// lib/regulator-radar/index.ts
import {
  fetchFemaAndRbi,
  fetchSebi,
  fetchLabourAndEpfo,
  fetchMca,
  fetchCci,
  fetchIbbi,
  fetchTax
} from './sources'
import { RadarResponse, RegulatorUpdate, SourceCheckResult, RegulatorKey } from './types'

function withTimeout<T>(promiseFn: () => Promise<T>, timeoutMs = 6000, fallback: T): Promise<T> {
  let timer: NodeJS.Timeout
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      resolve(fallback)
    }, timeoutMs)
  })

  return Promise.race([
    promiseFn().then((res) => {
      clearTimeout(timer)
      return res
    }).catch(() => {
      clearTimeout(timer)
      return fallback
    }),
    timeoutPromise
  ])
}

export async function runRegulatorRadar(
  filterHours = 72,
  enabledRegulators?: RegulatorKey[]
): Promise<RadarResponse> {
  const sources: SourceCheckResult[] = []
  const allItems: RegulatorUpdate[] = []

  // Define tasks to run concurrently with strict 6s timeouts
  const allTasks: {
    regulator: RegulatorKey
    label: string
    fn: () => Promise<RegulatorUpdate[]>
  }[] = [
    { regulator: 'FEMA', label: 'RBI FEMA / FED', fn: () => fetchFemaAndRbi(filterHours) },
    { regulator: 'SEBI', label: 'SEBI Circulars & PR', fn: () => fetchSebi(filterHours) },
    { regulator: 'LABOUR', label: 'Labour / EPFO / ESIC', fn: () => fetchLabourAndEpfo(filterHours) },
    { regulator: 'MCA', label: 'MCA General Circulars', fn: () => fetchMca(filterHours) },
    { regulator: 'CCI', label: 'Competition Commission', fn: () => fetchCci(filterHours) },
    { regulator: 'IBBI', label: 'IBBI Circulars', fn: () => fetchIbbi(filterHours) },
    { regulator: 'TAX', label: 'Income Tax / GST', fn: () => fetchTax(filterHours) },
  ]

  // Filter tasks if enabledRegulators list is provided
  const tasks = enabledRegulators && enabledRegulators.length > 0
    ? allTasks.filter(t => enabledRegulators.includes(t.regulator))
    : allTasks

  // Run all tasks in parallel with a strict 6-second timeout per task
  const results = await Promise.allSettled(
    tasks.map(t => withTimeout(t.fn, 6000, [] as RegulatorUpdate[]))
  )

  results.forEach((res, idx) => {
    const task = tasks[idx]
    if (res.status === 'fulfilled') {
      const items = res.value || []
      sources.push({
        regulator: task.regulator,
        label: task.label,
        status: items.length > 0 ? 'ok' : 'empty',
        count: items.length
      })
      allItems.push(...items)
    } else {
      sources.push({
        regulator: task.regulator,
        label: task.label,
        status: 'error',
        count: 0,
        error: 'Timeout or network unreachable'
      })
    }
  })

  // Deduplicate items by ID
  const seenMap = new Map<string, RegulatorUpdate>()
  for (const item of allItems) {
    if (!seenMap.has(item.id)) {
      seenMap.set(item.id, item)
    }
  }

  const uniqueItems = Array.from(seenMap.values())
  // Sort descending by date
  uniqueItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const hasErrors = sources.some(s => s.status === 'error')
  const status = hasErrors ? (uniqueItems.length > 0 ? 'partial' : 'error') : 'ok'

  return {
    status,
    checkedAt: new Date().toISOString(),
    filterHours,
    totalFound: uniqueItems.length,
    sources,
    items: uniqueItems
  }
}
