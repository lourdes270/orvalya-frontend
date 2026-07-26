import { useEffect, useMemo, useRef, useState } from 'react'
import type { Perfil } from '../../../contexts/AuthContextType'
import {
  resumenDocumentos,
  semaforoDesdeResumen,
  type ResumenDocumentos,
} from '../../../lib/documentoVencimiento'
import { DOCUMENTOS_CONFIG } from './documentosConfig'
import { emptyDocEstado, type DocEstado } from './documentosTypes'
import { fetchVigenteDocuments, uploadDocumentVersion } from './uploadDocument'

export function useDocumentosPrestador(
  perfil: Perfil,
  onResumenChange?: (resumen: ResumenDocumentos, semaforo: 'verde' | 'amarillo' | 'rojo') => void,
) {
  const [docs, setDocs] = useState<Record<string, DocEstado>>(() =>
    Object.fromEntries(DOCUMENTOS_CONFIG.map(d => [d.key, emptyDocEstado()])),
  )
  const onResumenChangeRef = useRef(onResumenChange)
  onResumenChangeRef.current = onResumenChange

  const resumen = useMemo(() => {
    const items = DOCUMENTOS_CONFIG.map(d => ({
      subido: docs[d.key]?.subido ?? false,
      fechaVencimiento: docs[d.key]?.fechaVencimientoGuardada ?? docs[d.key]?.fecha_vencimiento,
    }))
    return resumenDocumentos(items, DOCUMENTOS_CONFIG.length)
  }, [docs])

  useEffect(() => {
    onResumenChangeRef.current?.(resumen, semaforoDesdeResumen(resumen))
  }, [resumen])

  useEffect(() => {
    if (!perfil?.id) return

    fetchVigenteDocuments(perfil.id).then(({ data, error }) => {
      if (error?.message?.includes('permission denied')) return
      if (!data?.length) return

      setDocs(prev => {
        const next = { ...prev }
        data.forEach(row => {
          const key = row.tipo_documento ?? row.nombre
          if (!key || !next[key]) return
          const fecha = row.fecha_vencimiento ?? ''
          next[key] = {
            ...next[key],
            subido: true,
            fecha_vencimiento: fecha.slice(0, 10),
            fechaVencimientoGuardada: fecha.slice(0, 10) || null,
            versionActual: row.version ?? null,
          }
        })
        return next
      })
    }).catch(console.error)
  }, [perfil?.id])

  const setDoc = (key: string, changes: Partial<DocEstado>) => {
    setDocs(prev => ({ ...prev, [key]: { ...prev[key], ...changes } }))
  }

  const subir = async (key: string) => {
    const doc = docs[key]
    if (!doc.archivo || !doc.fecha_vencimiento || !doc.declaracionAceptada || !perfil) return

    setDoc(key, { subiendo: true, error: '' })
    const { error, version } = await uploadDocumentVersion({
      prestadorId: perfil.id,
      tipoDocumento: key,
      archivo: doc.archivo,
      fechaVencimiento: doc.fecha_vencimiento,
    })

    if (error) {
      setDoc(key, { error, subiendo: false })
      return
    }

    setDoc(key, {
      subido: true,
      subiendo: false,
      declaracionAceptada: false,
      archivo: null,
      versionActual: version ?? null,
      fechaVencimientoGuardada: doc.fecha_vencimiento,
    })
  }

  return { docs, setDoc, subir, resumen }
}
