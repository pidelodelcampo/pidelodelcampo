'use client'

import Link from 'next/link'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const departamentos = [
  'Bogotá D.C.',
  'Amazonas',
  'Antioquia',
  'Arauca',
  'Atlántico',
  'Bolívar',
  'Boyacá',
  'Caldas',
  'Caquetá',
  'Casanare',
  'Cauca',
  'Cesar',
  'Chocó',
  'Córdoba',
  'Cundinamarca',
  'Guainía',
  'Guaviare',
  'Huila',
  'La Guajira',
  'Magdalena',
  'Meta',
  'Nariño',
  'Norte de Santander',
  'Putumayo',
  'Quindío',
  'Risaralda',
  'San Andrés y Providencia',
  'Santander',
  'Sucre',
  'Tolima',
  'Valle del Cauca',
  'Vaupés',
  'Vichada',
]

type Perfil = {
  nombrevendedor: string
  telefono: string
  email: string
  departamento: string
  municipio: string
  direccion: string
  avatarurl: string
  documento: string
  sexo: string
  planactual: 'free' | 'vip'
}

type Producto = {
  id: string
  nombreproducto: string
  categoria: string
  departamento: string
  municipio: string
  precio: number
  plan: 'free' | 'vip'
  vipactivo: boolean
  estado: string
  createdat: string
  foto?: string | null
  paymentstatus?: string | null
}

function capitalizeWords(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trimStart()
    .replace(/\b\w/g, (l) => l.toUpperCase())
}

function formatCOP(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function initials(name: string, email?: string) {
  const base = (name || email || 'PC').trim()
  const parts = base.split(' ').filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

function formatShortDate(value?: string) {
  if (!value) return 'Sin fecha'
  return new Date(value).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getVipConfirmado(item: Producto) {
  if (item.plan !== 'vip') return false
  if (item.paymentstatus) return item.paymentstatus === 'approved'
  return !!item.vipactivo
}

function getEstadoVipLabel(item: Producto) {
  const pago = item.paymentstatus?.toLowerCase()

  if (item.plan === 'vip') {
    if (pago === 'approved') return 'VIP ACTIVO'
    if (['pending', 'in_process', 'authorized'].includes(pago || '')) return 'PAGO PENDIENTE'
    if (['rejected', 'cancelled', 'failed'].includes(pago || '')) return 'PAGO NO APROBADO'
    if (!pago && item.vipactivo) return 'VIP ACTIVO'
    return 'EN ESPERA DE PAGO'
  }

  return 'PUBLICACIÓN GRATIS'
}

function getEstadoVipStyles(item: Producto): CSSProperties {
  const label = getEstadoVipLabel(item)

  if (label === 'VIP ACTIVO') {
    return {
      background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
      color: '#111827',
      border: '1px solid rgba(245,158,11,0.32)',
    }
  }

  if (label === 'PAGO PENDIENTE' || label === 'EN ESPERA DE PAGO') {
    return {
      background: '#fff7ed',
      color: '#9a3412',
      border: '1px solid #fed7aa',
    }
  }

  if (label === 'PAGO NO APROBADO') {
    return {
      background: '#fef2f2',
      color: '#b91c1c',
      border: '1px solid #fecaca',
    }
  }

  return {
    background: '#ecfdf5',
    color: '#166534',
    border: '1px solid #bbf7d0',
  }
}

function getEstadoPublicacionStyles(estado: string): CSSProperties {
  const normal = estado.toLowerCase()

  if (normal === 'published') {
    return {
      background: '#ecfdf5',
      color: '#166534',
      border: '1px solid #bbf7d0',
    }
  }

  if (normal === 'pending_payment') {
    return {
      background: '#fff7ed',
      color: '#9a3412',
      border: '1px solid #fed7aa',
    }
  }

  if (normal === 'draft') {
    return {
      background: '#f3f4f6',
      color: '#374151',
      border: '1px solid #e5e7eb',
    }
  }

  return {
    background: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
  }
}

const s: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #effdf5 0%, #ffffff 42%, #f8fafc 100%)',
    padding: '12px',
    color: '#111827',
  },
  wrap: {
    maxWidth: '1120px',
    margin: '0 auto',
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '30px',
    padding: '20px',
    background: 'linear-gradient(135deg, #14532d 0%, #16a34a 58%, #22c55e 100%)',
    color: '#ffffff',
    boxShadow: '0 22px 48px rgba(21,128,61,.18)',
    marginBottom: '16px',
    isolation: 'isolate',
  },
  heroGlow: {
    position: 'absolute',
    inset: -10,
    background:
      'radial-gradient(circle at 84% 18%, rgba(255,255,255,0.18), transparent 16%), radial-gradient(circle at 12% 78%, rgba(255,255,255,0.12), transparent 20%)',
    zIndex: 0,
    pointerEvents: 'none',
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
  },
  heroTitle: {
    margin: '0 0 8px',
    fontSize: 'clamp(28px, 8vw, 42px)',
    fontWeight: 900,
    lineHeight: 1.03,
    letterSpacing: '-0.03em',
  },
  heroText: {
    margin: 0,
    lineHeight: 1.6,
    fontSize: '14px',
    color: 'rgba(255,255,255,.94)',
  },
  heroChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '16px',
    marginBottom: '16px',
  },
  heroChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 12px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.14)',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.18)',
    fontSize: '12px',
    fontWeight: 800,
  },
  topActions: {
    display: 'grid',
    gap: '10px',
    marginTop: '16px',
  },
  btn: {
    minHeight: '52px',
    borderRadius: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    fontWeight: 900,
    fontSize: '14px',
    padding: '0 16px',
    border: 'none',
    cursor: 'pointer',
  },
  btnWhite: {
    background: '#ffffff',
    color: '#111827',
    border: '1px solid #d1d5db',
  },
  btnGold: {
    background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
    color: '#111827',
    boxShadow: '0 12px 26px rgba(245,158,11,.22)',
  },
  btnGreen: {
    background: '#16a34a',
    color: '#ffffff',
  },
  btnSoft: {
    background: '#ecfdf5',
    color: '#166534',
    border: '1px solid #bbf7d0',
  },
  card: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '24px',
    padding: '18px',
    boxShadow: '0 12px 28px rgba(15,23,42,.06)',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '28px',
    fontWeight: 900,
  },
  text: {
    margin: '0 0 16px',
    color: '#6b7280',
    fontSize: '14px',
    lineHeight: 1.6,
  },
  profileHead: {
    display: 'grid',
    gap: '14px',
  },
  avatarWrap: {
    display: 'grid',
    gap: '10px',
    justifyItems: 'start',
  },
  avatar: {
    width: '98px',
    height: '98px',
    borderRadius: '24px',
    objectFit: 'cover',
    background: '#dcfce7',
    color: '#166534',
    display: 'grid',
    placeItems: 'center',
    fontSize: '30px',
    fontWeight: 900,
    border: '2px solid #bbf7d0',
    overflow: 'hidden',
  },
  pills: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  pill: {
    borderRadius: '999px',
    padding: '8px 12px',
    background: '#ecfdf5',
    color: '#166534',
    fontSize: '12px',
    fontWeight: 800,
    border: '1px solid #bbf7d0',
  },
  stat: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '18px',
    padding: '14px',
  },
  statNum: {
    fontSize: '26px',
    fontWeight: 900,
    color: '#14532d',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '13px',
    color: '#4b5563',
    fontWeight: 700,
  },
  form: {
    display: 'grid',
    gap: '12px',
    marginTop: '16px',
  },
  row2: {
    display: 'grid',
    gap: '12px',
  },
  field: {
    display: 'grid',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 800,
  },
  input: {
    width: '100%',
    minHeight: '52px',
    borderRadius: '14px',
    border: '1px solid #d1d5db',
    padding: '0 14px',
    fontSize: '14px',
    outline: 'none',
    background: '#ffffff',
    color: '#111827',
  },
  productList: {
    display: 'grid',
    gap: '12px',
  },
  productCard: {
    display: 'grid',
    gap: '12px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '22px',
    padding: '12px',
    boxShadow: '0 10px 24px rgba(15,23,42,.04)',
  },
  productImgWrap: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '16px',
  },
  productImg: {
    width: '100%',
    height: '190px',
    objectFit: 'cover',
    borderRadius: '16px',
    background: '#f3f4f6',
    display: 'block',
  },
  productOverlay: {
    position: 'absolute',
    left: '12px',
    bottom: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 11px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.92)',
    color: '#14532d',
    fontSize: '12px',
    fontWeight: 800,
    backdropFilter: 'blur(8px)',
  },
  productMeta: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  badge: {
    borderRadius: '999px',
    padding: '7px 10px',
    fontSize: '12px',
    fontWeight: 800,
    background: '#f3f4f6',
    color: '#374151',
    border: '1px solid #e5e7eb',
  },
  ok: {
    marginTop: '12px',
    background: '#ecfdf5',
    color: '#166534',
    border: '1px solid #bbf7d0',
    borderRadius: '16px',
    padding: '14px',
    fontSize: '14px',
    lineHeight: 1.6,
  },
  err: {
    marginTop: '12px',
    background: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '16px',
    padding: '14px',
    fontSize: '14px',
    lineHeight: 1.6,
  },
  infoBox: {
    marginTop: '14px',
    background: '#fff7ed',
    color: '#9a3412',
    border: '1px solid #fed7aa',
    borderRadius: '16px',
    padding: '14px',
    fontSize: '13px',
    lineHeight: 1.6,
  },
  asideCard: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '24px',
    padding: '18px',
    boxShadow: '0 12px 28px rgba(15,23,42,.06)',
  },
  asideTitle: {
    margin: '0 0 10px',
    fontSize: '20px',
    fontWeight: 900,
    color: '#111827',
  },
}

export default function PerfilClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputAvatarRef = useRef<HTMLInputElement | null>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [productos, setProductos] = useState<Producto[]>([])
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [perfil, setPerfil] = useState<Perfil>({
    nombrevendedor: '',
    telefono: '',
    email: '',
    departamento: 'Bogotá D.C.',
    municipio: '',
    direccion: '',
    avatarurl: '',
    documento: '',
    sexo: '',
    planactual: 'free',
  })

  const publicaciones = useMemo(() => productos.length, [productos])
  const vipCount = useMemo(
    () => productos.filter((p) => getVipConfirmado(p)).length,
    [productos]
  )
  const vipPendientes = useMemo(
    () => productos.filter((p) => p.plan === 'vip' && !getVipConfirmado(p)).length,
    [productos]
  )

  const perfilChecklist = useMemo(
    () => [
      { label: 'Nombre del vendedor', ok: perfil.nombrevendedor.trim().length >= 3 },
      { label: 'Teléfono', ok: perfil.telefono.trim().length >= 7 },
      { label: 'Departamento', ok: perfil.departamento.trim().length > 0 },
      { label: 'Municipio', ok: perfil.municipio.trim().length >= 2 },
      { label: 'Dirección', ok: perfil.direccion.trim().length >= 5 },
      { label: 'Documento', ok: perfil.documento.trim().length >= 6 },
      { label: 'Sexo', ok: perfil.sexo.trim().length > 0 },
      { label: 'Avatar', ok: !!perfil.avatarurl },
    ],
    [perfil]
  )

  const perfilProgreso = useMemo(() => {
    const completos = perfilChecklist.filter((item) => item.ok).length
    return Math.round((completos / perfilChecklist.length) * 100)
  }, [perfilChecklist])

  const valorTotalPublicado = useMemo(
    () => productos.reduce((acc, item) => acc + Number(item.precio || 0), 0),
    [productos]
  )

  useEffect(() => {
    const load = async () => {
      const { data: authData } = await supabase.auth.getUser()

      if (!authData.user) {
        router.replace('/ingresar?next=/perfil')
        return
      }

      setUser(authData.user)

      const { data: perfilData } = await supabase
        .from('profiles')
        .select('*')
        .eq('userid', authData.user.id)
        .maybeSingle()

      const { data: productosData } = await supabase
        .from('products')
        .select('*')
        .eq('userid', authData.user.id)
        .order('createdat', { ascending: false })

      const products = (productosData || []) as any[]
      const ids = products.map((p: any) => p.id)

      const imagesMap: Record<string, string> = {}
      const paymentMap: Record<string, string> = {}

      if (ids.length > 0) {
        const { data: imagesData } = await supabase
          .from('productimages')
          .select('productid, imageurl, sortorder')
          .in('productid', ids)
          .order('sortorder', { ascending: true })

        ;(imagesData || []).forEach((img: any) => {
          if (!imagesMap[img.productid]) imagesMap[img.productid] = img.imageurl
        })

        const { data: pagosData } = await supabase
          .from('vippayments')
          .select('productid, paymentstatus, createdat')
          .in('productid', ids)
          .order('createdat', { ascending: false })

        ;(pagosData || []).forEach((pago: any) => {
          if (!paymentMap[pago.productid]) paymentMap[pago.productid] = pago.paymentstatus
        })
      }

      if (perfilData) {
        setPerfil({
          nombrevendedor: perfilData.nombrevendedor || '',
          telefono: perfilData.telefono || '',
          email: perfilData.email || authData.user.email || '',
          departamento: perfilData.departamento || 'Bogotá D.C.',
          municipio: perfilData.municipio || '',
          direccion: perfilData.direccion || '',
          avatarurl: perfilData.avatarurl || '',
          documento: perfilData.documento || '',
          sexo: perfilData.sexo || '',
          planactual: perfilData.planactual || 'free',
        })
      } else {
        setPerfil((prev) => ({
          ...prev,
          nombrevendedor: authData.user.user_metadata?.nombrenegocio || '',
          email: authData.user.email || '',
        }))
      }

      setProductos(
        products.map((p: any) => ({
          ...p,
          foto: imagesMap[p.id] || null,
          paymentstatus: paymentMap[p.id] || null,
        }))
      )

      if (searchParams.get('publicado') === '1') {
        setMensaje('Tu publicación quedó guardada correctamente.')
      }

      setLoading(false)
    }

    load()
  }, [router, searchParams])

  const guardarPerfil = async () => {
    if (!user) return

    setSaving(true)
    setMensaje('')
    setError('')

    const payload = {
      userid: user.id,
      nombrevendedor: perfil.nombrevendedor || 'Vendedor',
      telefono: perfil.telefono,
      email: user.email || perfil.email,
      departamento: perfil.departamento,
      municipio: perfil.municipio,
      direccion: perfil.direccion,
      avatarurl: perfil.avatarurl,
      documento: perfil.documento,
      sexo: perfil.sexo,
      planactual: perfil.planactual,
    }

    const { error } = await supabase.from('profiles').upsert(payload, {
      onConflict: 'userid',
    })

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    setMensaje('Perfil actualizado correctamente.')
  }

  const subirAvatar = async (file?: File) => {
    if (!file || !user) return

    setSaving(true)
    setMensaje('')
    setError('')

    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${user.id}/avatar-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      setSaving(false)
      setError(uploadError.message)
      return
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)

    setPerfil((prev) => ({
      ...prev,
      avatarurl: data.publicUrl,
    }))

    setSaving(false)
    setMensaje('Avatar subido. Ahora guarda el perfil.')
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    router.replace('/')
  }

  if (loading) {
    return (
      <main style={s.page}>
        <div style={s.wrap}>
          <div style={s.card}>Cargando perfil...</div>
        </div>
      </main>
    )
  }

  return (
    <main style={s.page}>
      <style jsx global>{`
        .perfil-layout {
          display: grid;
          gap: 14px;
        }
        .perfil-hero-chip {
          animation: profileFloat 4.5s ease-in-out infinite;
        }
        .perfil-hero-chip:nth-child(2) {
          animation-delay: 0.6s;
        }
        .perfil-hero-chip:nth-child(3) {
          animation-delay: 1.1s;
        }
        .perfil-hero-chip:nth-child(4) {
          animation-delay: 1.7s;
        }
        .perfil-live-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 16px;
        }
        .perfil-live-card {
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 18px;
          padding: 12px;
          backdrop-filter: blur(8px);
        }
        .perfil-live-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.85);
          font-weight: 700;
          margin-bottom: 4px;
        }
        .perfil-live-value {
          font-size: 24px;
          font-weight: 900;
          color: #ffffff;
        }
        .glass-pulse {
          position: relative;
          overflow: hidden;
        }
        .glass-pulse::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 255, 255, 0.22) 42%,
            transparent 84%
          );
          transform: translateX(-130%);
          animation: shineMove 5.3s linear infinite;
          pointer-events: none;
        }
        .stats-grid-enhanced {
          display: grid;
          gap: 10px;
          margin-top: 16px;
        }
        .checklist-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
        .check-item {
          border-radius: 999px;
          padding: 9px 10px;
          font-size: 12px;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .check-ok {
          background: #ecfdf5;
          color: #166534;
          border: 1px solid #bbf7d0;
        }
        .check-pending {
          background: #f8fafc;
          color: #4b5563;
          border: 1px solid #e5e7eb;
        }
        .perfil-progress-track {
          width: 100%;
          height: 12px;
          background: #e5e7eb;
          border-radius: 999px;
          overflow: hidden;
          margin-top: 12px;
        }
        .perfil-progress-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
          transition: width 220ms ease;
        }
        .product-grid-enhanced article {
          transition:
            transform 220ms ease,
            box-shadow 220ms ease,
            border-color 220ms ease;
        }
        .product-grid-enhanced article:hover {
          transform: translateY(-5px);
          box-shadow: 0 18px 38px rgba(15, 23, 42, 0.08);
          border-color: #dbe5e0;
        }
        .product-grid-enhanced img {
          transition: transform 320ms ease;
        }
        .product-grid-enhanced article:hover img {
          transform: scale(1.04);
        }
        .sticky-summary {
          position: sticky;
          top: 12px;
        }
        @keyframes profileFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        @keyframes shineMove {
          0% {
            transform: translateX(-130%);
          }
          100% {
            transform: translateX(130%);
          }
        }
        @media (min-width: 960px) {
          .perfil-layout {
            grid-template-columns: minmax(0, 1.25fr) minmax(360px, 0.82fr);
            align-items: start;
          }
          .perfil-row-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .stats-grid-enhanced {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .perfil-hero-actions {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .perfil-live-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
      `}</style>

      <div style={s.wrap}>
        <section style={s.hero} className="glass-pulse">
          <div style={s.heroGlow} />
          <div style={s.heroContent}>
            <h1 style={s.heroTitle}>Tu perfil</h1>
            <p style={s.heroText}>
              Completa tus datos, fortalece tu confianza y revisa el estado real de
              tus publicaciones y pagos VIP.
            </p>

            <div style={s.heroChips}>
              <span style={s.heroChip} className="perfil-hero-chip">
                Perfil más confiable
              </span>
              <span style={s.heroChip} className="perfil-hero-chip">
                Control total de publicaciones
              </span>
              <span style={s.heroChip} className="perfil-hero-chip">
                VIP solo si está confirmado
              </span>
              <span style={s.heroChip} className="perfil-hero-chip">
                Vista clara para celular
              </span>
            </div>

            <div style={s.topActions} className="perfil-hero-actions">
              <Link href="/publicar" style={{ ...s.btn, ...s.btnGold }}>
                Publicar producto
              </Link>
              <Link href="/catalogo" style={{ ...s.btn, ...s.btnWhite }}>
                Ver catálogo
              </Link>
              <Link href="/" style={{ ...s.btn, ...s.btnWhite }}>
                Volver al inicio
              </Link>
            </div>

            <div className="perfil-live-grid">
              <div className="perfil-live-card">
                <div className="perfil-live-label">Publicaciones</div>
                <div className="perfil-live-value">{publicaciones}</div>
              </div>
              <div className="perfil-live-card">
                <div className="perfil-live-label">VIP activos</div>
                <div className="perfil-live-value">{vipCount}</div>
              </div>
              <div className="perfil-live-card">
                <div className="perfil-live-label">VIP pendientes</div>
                <div className="perfil-live-value">{vipPendientes}</div>
              </div>
              <div className="perfil-live-card">
                <div className="perfil-live-label">Perfil completo</div>
                <div className="perfil-live-value">{perfilProgreso}%</div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="perfil-layout">
            <section style={s.card}>
              <div style={s.profileHead}>
                <div style={s.avatarWrap}>
                  {perfil.avatarurl ? (
                    <img src={perfil.avatarurl} alt="Avatar" style={s.avatar} />
                  ) : (
                    <div style={s.avatar}>{initials(perfil.nombrevendedor, user?.email)}</div>
                  )}

                  <input
                    ref={inputAvatarRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => subirAvatar(e.target.files?.[0])}
                    style={{ display: 'none' }}
                  />

                  <button
                    type="button"
                    onClick={() => inputAvatarRef.current?.click()}
                    style={{ ...s.btn, ...s.btnGreen }}
                  >
                    Elegir avatar
                  </button>
                </div>

                <div>
                  <h2 style={s.title}>Datos del perfil</h2>
                  <p style={s.text}>
                    Entre más completo esté tu perfil, más confianza genera y mejor
                    se ve tu presencia en la plataforma.
                  </p>

                  <div style={s.pills}>
                    <span style={s.pill}>{user?.email}</span>
                    <span style={s.pill}>{publicaciones} publicaciones</span>
                    <span style={s.pill}>{vipCount} VIP activos</span>
                    <span style={s.pill}>{vipPendientes} pendientes</span>
                  </div>

                  <div className="perfil-progress-track">
                    <div
                      className="perfil-progress-fill"
                      style={{ width: `${perfilProgreso}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="stats-grid-enhanced">
                <div style={s.stat}>
                  <div style={s.statNum}>{publicaciones}</div>
                  <div style={s.statLabel}>Productos publicados</div>
                </div>
                <div style={s.stat}>
                  <div style={s.statNum}>{vipCount}</div>
                  <div style={s.statLabel}>VIP realmente activos</div>
                </div>
                <div style={s.stat}>
                  <div style={s.statNum}>{formatCOP(valorTotalPublicado)}</div>
                  <div style={s.statLabel}>Valor total publicado</div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 16,
                  borderRadius: 18,
                  border: '1px solid #e5e7eb',
                  background: '#f8fafc',
                  padding: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 900,
                    color: '#111827',
                    marginBottom: 10,
                  }}
                >
                  Checklist del perfil
                </div>

                <div className="checklist-grid">
                  {perfilChecklist.map((item) => (
                    <div
                      key={item.label}
                      className={`check-item ${item.ok ? 'check-ok' : 'check-pending'}`}
                    >
                      <span>{item.ok ? '✓' : '•'}</span>
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              <div style={s.form}>
                <div style={s.row2} className="perfil-row-2">
                  <div style={s.field}>
                    <label style={s.label}>Nombre del vendedor o finca</label>
                    <input
                      style={s.input}
                      value={perfil.nombrevendedor}
                      onChange={(e) =>
                        setPerfil((p) => ({
                          ...p,
                          nombrevendedor: capitalizeWords(e.target.value),
                        }))
                      }
                      placeholder="Ej: Finca La Esperanza"
                    />
                  </div>

                  <div style={s.field}>
                    <label style={s.label}>Documento</label>
                    <input
                      style={s.input}
                      value={perfil.documento}
                      onChange={(e) =>
                        setPerfil((p) => ({
                          ...p,
                          documento: e.target.value.replace(/\D/g, ''),
                        }))
                      }
                      placeholder="Ej: 1012345678"
                      inputMode="numeric"
                    />
                  </div>
                </div>

                <div style={s.row2} className="perfil-row-2">
                  <div style={s.field}>
                    <label style={s.label}>Sexo</label>
                    <select
                      style={s.input}
                      value={perfil.sexo}
                      onChange={(e) =>
                        setPerfil((p) => ({
                          ...p,
                          sexo: e.target.value,
                        }))
                      }
                    >
                      <option value="">Selecciona</option>
                      <option value="Mujer">Mujer</option>
                      <option value="Hombre">Hombre</option>
                      <option value="Otro">Otro</option>
                      <option value="Prefiero no decir">Prefiero no decir</option>
                    </select>
                  </div>

                  <div style={s.field}>
                    <label style={s.label}>Teléfono</label>
                    <input
                      style={s.input}
                      value={perfil.telefono}
                      onChange={(e) =>
                        setPerfil((p) => ({
                          ...p,
                          telefono: e.target.value.replace(/\D/g, ''),
                        }))
                      }
                      placeholder="3001234567"
                      inputMode="numeric"
                    />
                  </div>
                </div>

                <div style={s.field}>
                  <label style={s.label}>Dirección</label>
                  <input
                    style={s.input}
                    value={perfil.direccion}
                    onChange={(e) =>
                      setPerfil((p) => ({
                        ...p,
                        direccion: capitalizeWords(e.target.value),
                      }))
                    }
                    placeholder="Calle 10 # 15 - 20"
                  />
                </div>

                <div style={s.row2} className="perfil-row-2">
                  <div style={s.field}>
                    <label style={s.label}>Departamento</label>
                    <select
                      style={s.input}
                      value={perfil.departamento}
                      onChange={(e) =>
                        setPerfil((p) => ({
                          ...p,
                          departamento: e.target.value,
                        }))
                      }
                    >
                      {departamentos.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={s.field}>
                    <label style={s.label}>Municipio</label>
                    <input
                      style={s.input}
                      value={perfil.municipio}
                      onChange={(e) =>
                        setPerfil((p) => ({
                          ...p,
                          municipio: capitalizeWords(e.target.value),
                        }))
                      }
                      placeholder="Ej: Fusagasugá"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={guardarPerfil}
                  style={{ ...s.btn, ...s.btnGold }}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar perfil'}
                </button>

                <button
                  type="button"
                  onClick={cerrarSesion}
                  style={{ ...s.btn, ...s.btnWhite }}
                >
                  Cerrar sesión
                </button>
              </div>

              {mensaje ? <div style={s.ok}>{mensaje}</div> : null}
              {error ? <div style={s.err}>{error}</div> : null}
            </section>

            <aside className="sticky-summary" style={s.asideCard}>
              <h3 style={s.asideTitle}>Resumen del perfil</h3>

              <div className="stats-grid-enhanced" style={{ marginTop: 0 }}>
                <div style={s.stat}>
                  <div style={s.statNum}>{perfilProgreso}%</div>
                  <div style={s.statLabel}>Perfil completo</div>
                </div>
                <div style={s.stat}>
                  <div style={s.statNum}>{vipPendientes}</div>
                  <div style={s.statLabel}>VIP pendientes</div>
                </div>
                <div style={s.stat}>
                  <div style={s.statNum}>
                    {productos.filter((p) => p.estado === 'published').length}
                  </div>
                  <div style={s.statLabel}>Publicadas</div>
                </div>
              </div>

              <div style={s.infoBox}>
                Una publicación solo debe verse como VIP cuando el pago está realmente
                confirmado. Si el pago sigue pendiente, aquí se muestra como pendiente
                y no como VIP activo.
              </div>

              <div
                style={{
                  marginTop: 14,
                  borderRadius: 18,
                  border: '1px solid #e5e7eb',
                  background: '#f8fafc',
                  padding: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 900,
                    color: '#111827',
                    marginBottom: 10,
                  }}
                >
                  Vista rápida
                </div>

                <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>
                  <div>
                    <strong>Negocio:</strong> {perfil.nombrevendedor || 'Sin nombre aún'}
                  </div>
                  <div>
                    <strong>Ciudad:</strong> {perfil.municipio || 'Sin municipio'} /{' '}
                    {perfil.departamento}
                  </div>
                  <div>
                    <strong>Teléfono:</strong> {perfil.telefono || 'Sin teléfono'}
                  </div>
                  <div>
                    <strong>Email:</strong> {perfil.email || user?.email || 'Sin correo'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
                <Link href="/publicar" style={{ ...s.btn, ...s.btnGreen }}>
                  Publicar nuevo producto
                </Link>
                <Link href="/catalogo" style={{ ...s.btn, ...s.btnSoft }}>
                  Ver catálogo
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <section style={{ ...s.card, marginTop: 14 }}>
          <h2 style={s.title}>Mis publicaciones</h2>
          <p style={s.text}>
            Aquí ves tus productos con su estado real, incluyendo si el VIP ya está
            aprobado o sigue pendiente.
          </p>

          <div style={s.productList} className="product-grid-enhanced">
            {productos.length === 0 ? (
              <div style={s.stat}>Todavía no has publicado productos.</div>
            ) : (
              productos.map((item) => {
                const vipLabel = getEstadoVipLabel(item)
                const vipStyles = getEstadoVipStyles(item)
                const estadoStyles = getEstadoPublicacionStyles(item.estado)

                return (
                  <article key={item.id} style={s.productCard}>
                    <div style={s.productImgWrap}>
                      <img
                        src={item.foto || '/placeholder-producto.jpg'}
                        alt={item.nombreproducto}
                        style={s.productImg}
                      />
                      <div style={s.productOverlay}>{item.categoria || 'Producto'}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.15 }}>
                        {item.nombreproducto}
                      </div>

                      <div
                        style={{
                          color: '#15803d',
                          fontWeight: 900,
                          marginTop: 6,
                          fontSize: 18,
                        }}
                      >
                        {formatCOP(item.precio)}
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          color: '#6b7280',
                          marginTop: 6,
                          lineHeight: 1.55,
                        }}
                      >
                        Publicado el {formatShortDate(item.createdat)}
                      </div>

                      <div style={{ ...s.productMeta, marginTop: 10 }}>
                        <span style={s.badge}>{item.municipio}</span>
                        <span style={s.badge}>{item.departamento}</span>
                        <span style={{ ...s.badge, ...vipStyles }}>{vipLabel}</span>
                        <span style={{ ...s.badge, ...estadoStyles }}>{item.estado}</span>
                      </div>

                      {item.plan === 'vip' && !getVipConfirmado(item) ? (
                        <div style={s.infoBox}>
                          Esta publicación aún no aparece como VIP activa. Se mantiene
                          pendiente hasta la confirmación del pago.
                        </div>
                      ) : null}

                      <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                        <Link href={`/catalogo/${item.id}`} style={{ ...s.btn, ...s.btnWhite }}>
                          Ver producto
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
