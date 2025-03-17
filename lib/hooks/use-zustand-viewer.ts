
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { useCentralStore } from "@/store/central.store"

type FilterMap = Record<string, string[]>

const useZustandViewer = (keys?: string[], filters?: FilterMap) => {
  const [filteredData, setFilteredData] = useState<any>(null)
  const zustandState = useCentralStore.getState()

  useEffect(() => {
    if (!keys || keys.length === 0) {
      setFilteredData(null)
      return
    }
    if (!zustandState.data) {
      setFilteredData(null)
      return
    }

    const data: any = {}
    keys.forEach((key) => {
      let keyData = zustandState.data[key]
      if (Array.isArray(keyData) && filters && Object.keys(filters).length > 0) {
        keyData = keyData.filter((item) => {
          return Object.entries(filters).every(([field, values]) => {
            if (!item || typeof item !== "object") return false
            const itemValue = item[field]
            if (!itemValue) return false
            return values.includes(itemValue)
          })
        })
      }
      data[key] = keyData
    })

    setFilteredData(data)
  }, [zustandState.data, keys, filters])

  return filteredData
}

export default useZustandViewer
