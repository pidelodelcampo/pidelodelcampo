import { Suspense } from 'react'
import IngresarClient from './IngresarClient'

export default function IngresarPage() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Cargando...</div>}>
      <IngresarClient />
    </Suspense>
  )
}
