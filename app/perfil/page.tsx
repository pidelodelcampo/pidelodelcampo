import { Suspense } from 'react'
import PerfilClient from './PerfilClient'

export default function PerfilPage() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Cargando...</div>}>
      <PerfilClient />
    </Suspense>
  )
}
