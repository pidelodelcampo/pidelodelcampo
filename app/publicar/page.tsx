'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
} from 'react'
import { supabase } from '@/lib/supabase'

const MERCADO_PAGO_VIP = 'https://mpago.li/1bgbi9Y'
const MAX_IMAGENES = 5

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

const categorias = [
  'Frutas',
  'Verduras',
  'Hortalizas',
  'Tubérculos',
  'Hierbas y aromáticas',
  'Granos y cereales',
  'Lácteos',
  'Huevos',
  'Aves',
  'Porcinos',
  'Bovinos',
  'Caprinos',
  'Ovinos',
  'Pescados y mariscos',
  'Abonos e insumos',
]

const tiposVenta = [
  'Por kilo',
  'Por litro',
  'Por unidad',
  'Por manojo',
  'Por caja',
  'Por bulto',
  'Al por mayor',
]

type Preview = {
  id: string
  file: File
  url: string
}

function capitalizeWords(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trimStart()
    .replace(/(^|\s)\S/g, (l) => l.toUpperCase())
}

function normalizeParagraph(value: string) {
  const clean = value.replace(/\s+/g, ' ').trimStart()
  if (!clean) return ''
  return clean.charAt(0).toUpperCase() + clean.slice(1)
}

function formatCOPInput(value: string) {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(digits))
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

const s: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at top right, rgba(250,204,21,0.16), transparent 24%), linear-gradient(180deg, #effdf5 0%, #ffffff 42%, #f8fafc 100%)',
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
    padding: '22px 18px',
    background: 'linear-gradient(135deg, #14532d 0%, #16a34a 58%, #22c55e 100%)',
    color: '#ffffff',
    boxShadow: '0 22px 48px rgba(21,128,61,0.18)',
    marginBottom: '16px',
    isolation: 'isolate',
  },
  heroGlow: {
    position: 'absolute',
    inset: '-10%',
    background:
      'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.18), transparent 16%), radial-gradient(circle at 10% 85%, rgba(255,255,255,0.12), transparent 20%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
  },
  heroTitle: {
    margin: '0 0 10px',
    fontSize: 'clamp(28px, 8vw, 50px)',
    lineHeight: 1.02,
    fontWeight: 900,
    letterSpacing: '-0.03em',
  },
  heroText: {
    margin: 0,
    fontSize: '15px',
    lineHeight: 1.65,
    color: 'rgba(255,255,255,0.95)',
  },
  heroBadgesWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '14px',
    marginBottom: '14px',
  },
  heroBadge: {
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
  topBtn: {
    minHeight: '50px',
    borderRadius: '15px',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 14px',
    fontWeight: 900,
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
  },
  topBtnLight: {
    background: '#ffffff',
    color: '#14532d',
  },
  topBtnGhost: {
    background: 'rgba(255,255,255,0.12)',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.18)',
  },
  liveGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '10px',
    marginTop: '16px',
  },
  liveCard: {
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.16)',
    borderRadius: '18px',
    padding: '12px',
    backdropFilter: 'blur(8px)',
  },
  liveLabel: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.85)',
    fontWeight: 700,
    marginBottom: '4px',
  },
  liveValue: {
    fontSize: '24px',
    fontWeight: 900,
    color: '#ffffff',
  },
  card: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '24px',
    padding: '18px',
    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.06)',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '30px',
    lineHeight: 1.05,
    fontWeight: 900,
  },
  text: {
    margin: '0 0 18px',
    color: '#6b7280',
    lineHeight: 1.6,
    fontSize: '14px',
  },
  progressPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    borderRadius: '999px',
    background: '#fffbeb',
    color: '#92400e',
    fontSize: '13px',
    fontWeight: 800,
    flexWrap: 'wrap',
    marginBottom: '14px',
  },
  progressBar: {
    width: '100%',
    height: '12px',
    borderRadius: '999px',
    background: '#e5e7eb',
    overflow: 'hidden',
    marginBottom: '16px',
  },
  progressFill: {
    height: '100%',
    borderRadius: '999px',
    background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
    transition: 'width 220ms ease',
  },
  checklistBox: {
    borderRadius: '18px',
    border: '1px solid #e5e7eb',
    background: '#f8fafc',
    padding: '14px',
    marginBottom: '16px',
  },
  checklistTitle: {
    margin: '0 0 10px',
    fontSize: '14px',
    fontWeight: 900,
    color: '#111827',
  },
  checklistGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '8px',
  },
  checklistItem: {
    fontSize: '12px',
    borderRadius: '999px',
    padding: '9px 10px',
    fontWeight: 800,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  form: {
    display: 'grid',
    gap: '12px',
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
    color: '#111827',
  },
  input: {
    width: '100%',
    minHeight: '54px',
    borderRadius: '14px',
    border: '1px solid #d1d5db',
    padding: '0 14px',
    fontSize: '14px',
    outline: 'none',
    background: '#ffffff',
    color: '#111827',
  },
  textarea: {
    width: '100%',
    minHeight: '128px',
    borderRadius: '14px',
    border: '1px solid #d1d5db',
    padding: '14px',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    background: '#ffffff',
    color: '#111827',
  },
  help: {
    margin: 0,
    fontSize: '12px',
    color: '#6b7280',
    lineHeight: 1.5,
  },
  imageUploadBox: {
    border: '1px dashed #86efac',
    borderRadius: '18px',
    padding: '16px',
    background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
  },
  uploadBtn: {
    minHeight: '50px',
    borderRadius: '14px',
    border: 'none',
    background: '#16a34a',
    color: '#ffffff',
    fontWeight: 900,
    fontSize: '14px',
    cursor: 'pointer',
    padding: '0 16px',
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '10px',
    marginTop: '12px',
  },
  previewCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '18px',
    overflow: 'hidden',
    background: '#ffffff',
  },
  previewImage: {
    width: '100%',
    height: '140px',
    objectFit: 'cover',
    display: 'block',
  },
  previewFooter: {
    display: 'grid',
    gap: '8px',
    padding: '10px',
  },
  removeBtn: {
    minHeight: '38px',
    borderRadius: '12px',
    border: '1px solid #fecaca',
    background: '#fff1f2',
    color: '#b91c1c',
    fontWeight: 800,
    cursor: 'pointer',
  },
  plans: {
    display: 'grid',
    gap: '12px',
    marginTop: '8px',
  },
  planCard: {
    borderRadius: '22px',
    border: '1px solid #e5e7eb',
    padding: '16px',
    background: '#ffffff',
    cursor: 'pointer',
    transition: 'all 220ms ease',
  },
  planVip: {
    border: '2px solid #f59e0b',
    background: 'linear-gradient(180deg, #fff7ed 0%, #ffffff 100%)',
    boxShadow: '0 16px 30px rgba(245,158,11,0.12)',
  },
  planLocked: {
    border: '1px solid #e5e7eb',
    background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)',
    opacity: 0.88,
  },
  planSelected: {
    boxShadow: '0 0 0 2px rgba(22,163,74,0.12), 0 18px 34px rgba(15,23,42,0.08)',
    transform: 'translateY(-2px)',
  },
  planHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '10px',
    flexWrap: 'wrap',
  },
  planTitle: {
    fontSize: '18px',
    fontWeight: 900,
  },
  badge: {
    borderRadius: '999px',
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: 900,
  },
  badgeVip: {
    background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
    color: '#111827',
  },
  badgeFree: {
    background: '#ecfdf5',
    color: '#166534',
  },
  badgeLock: {
    background: '#f3f4f6',
    color: '#374151',
  },
  benefits: {
    display: 'grid',
    gap: '8px',
    marginTop: '10px',
  },
  benefit: {
    fontSize: '14px',
    color: '#374151',
    lineHeight: 1.55,
  },
  trustBox: {
    marginTop: '14px',
    background: '#fffbeb',
    border: '1px solid #fde68a',
    color: '#92400e',
    borderRadius: '16px',
    padding: '12px 14px',
    fontSize: '13px',
    lineHeight: 1.55,
  },
  lockedBox: {
    marginTop: '14px',
    background: '#f8fafc',
    border: '1px solid #e5e7eb',
    color: '#4b5563',
    borderRadius: '16px',
    padding: '12px 14px',
    fontSize: '13px',
    lineHeight: 1.55,
  },
  smallPlanBtn: {
    minHeight: '42px',
    borderRadius: '12px',
    border: 'none',
    padding: '0 14px',
    fontWeight: 900,
    fontSize: '13px',
    cursor: 'pointer',
    marginTop: '14px',
  },
  actions: {
    display: 'grid',
    gap: '10px',
    marginTop: '18px',
  },
  btn: {
    minHeight: '54px',
    borderRadius: '16px',
    border: 'none',
    fontSize: '14px',
    fontWeight: 900,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 16px',
  },
  btnGreen: {
    background: '#16a34a',
    color: '#ffffff',
  },
  btnGold: {
    background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
    color: '#111827',
    boxShadow: '0 12px 26px rgba(245,158,11,0.22)',
  },
  btnWhite: {
    background: '#ffffff',
    color: '#111827',
    border: '1px solid #d1d5db',
  },
  btnDisabled: {
    background: '#e5e7eb',
    color: '#9ca3af',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  success: {
    marginTop: '16px',
    background: '#ecfdf5',
    color: '#166534',
    border: '1px solid #bbf7d0',
    borderRadius: '16px',
    padding: '14px',
    lineHeight: 1.6,
    fontSize: '14px',
  },
  error: {
    marginTop: '16px',
    background: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '16px',
    padding: '14px',
    lineHeight: 1.6,
    fontSize: '14px',
  },
  summaryCard: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '24px',
    padding: '18px',
    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.06)',
  },
  summaryTitle: {
    margin: '0 0 10px',
    fontSize: '20px',
    fontWeight: 900,
    color: '#111827',
  },
  summaryStat: {
    borderRadius: '18px',
    border: '1px solid #e5e7eb',
    background: '#f8fafc',
    padding: '14px',
  },
  summaryStatValue: {
    fontSize: '26px',
    fontWeight: 900,
    color: '#14532d',
    marginBottom: '4px',
  },
  summaryStatLabel: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#4b5563',
  },
}

export default function PublicarPage() {
  const router = useRouter()
  const inputImagenesRef = useRef<HTMLInputElement | null>(null)
  const imagenesRef = useRef<Preview[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [mensaje, setMensaje] = useState('')
  const [esError, setEsError] = useState(false)
  const [plan, setPlan] = useState<'vip' | 'free'>('free')
  const [imagenes, setImagenes] = useState<Preview[]>([])

  const [form, setForm] = useState({
    nombre_producto: '',
    nombre_vendedor: '',
    categoria: categorias[0],
    subcategoria: '',
    departamento: 'Bogotá D.C.',
    municipio: '',
    precio: '',
    tipo_venta: tiposVenta[0],
    descripcion: '',
    telefono: '',
    whatsapp: '',
  })

  useEffect(() => {
    imagenesRef.current = imagenes
  }, [imagenes])

  useEffect(() => {
    return () => {
      imagenesRef.current.forEach((img) => URL.revokeObjectURL(img.url))
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.replace('/ingresar?next=/publicar')
        return
      }

      setUser(data.user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .maybeSingle()

      setForm((prev) => ({
        ...prev,
        nombre_vendedor:
          profile?.nombre_vendedor ||
          data.user.user_metadata?.nombre_negocio ||
          '',
        telefono: profile?.telefono || '',
        whatsapp: profile?.telefono || '',
        departamento: profile?.departamento || 'Bogotá D.C.',
        municipio: profile?.municipio || '',
      }))

      setLoading(false)
    }

    load()
  }, [router])

  const precioNumero = useMemo(() => Number(form.precio.replace(/\D/g, '')) || 0, [form.precio])

  const requisitosBase = useMemo(
    () => [
      { label: 'Nombre del producto', ok: form.nombre_producto.trim().length >= 3 },
      { label: 'Nombre del vendedor', ok: form.nombre_vendedor.trim().length >= 3 },
      { label: 'Departamento', ok: form.departamento.trim().length > 0 },
      { label: 'Municipio', ok: form.municipio.trim().length >= 2 },
      { label: 'Precio', ok: precioNumero > 0 },
      { label: 'Teléfono', ok: onlyDigits(form.telefono).length >= 7 },
      { label: 'Descripción', ok: form.descripcion.trim().length >= 12 },
    ],
    [form, precioNumero]
  )

  const requisitosVip = useMemo(
    () => [
      ...requisitosBase,
      { label: 'WhatsApp', ok: onlyDigits(form.whatsapp || form.telefono).length >= 7 },
      { label: 'Al menos 1 imagen', ok: imagenes.length > 0 },
    ],
    [requisitosBase, form.whatsapp, form.telefono, imagenes.length]
  )

  const puedePublicarBase = useMemo(
    () => requisitosBase.every((item) => item.ok),
    [requisitosBase]
  )

  const puedeSeleccionarVip = useMemo(
    () => requisitosVip.every((item) => item.ok),
    [requisitosVip]
  )

  const progreso = useMemo(() => {
    const completos = requisitosVip.filter((item) => item.ok).length
    return Math.round((completos / requisitosVip.length) * 100)
  }, [requisitosVip])

  const faltantesVip = useMemo(
    () => requisitosVip.filter((item) => !item.ok).map((item) => item.label),
    [requisitosVip]
  )

  const resumen = useMemo(
    () => ({
      precio: precioNumero,
      imagenes: imagenes.length,
      telefono: onlyDigits(form.telefono),
      whatsapp: onlyDigits(form.whatsapp || form.telefono),
    }),
    [precioNumero, imagenes.length, form.telefono, form.whatsapp]
  )

  useEffect(() => {
    if (!puedeSeleccionarVip && plan === 'vip') {
      setPlan('free')
    }
  }, [puedeSeleccionarVip, plan])

  const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === 'precio') {
      setForm((prev) => ({
        ...prev,
        precio: formatCOPInput(value),
      }))
      return
    }

    if (name === 'telefono' || name === 'whatsapp') {
      setForm((prev) => ({
        ...prev,
        [name]: onlyDigits(value),
      }))
      return
    }

    if (['nombre_producto', 'nombre_vendedor', 'municipio', 'subcategoria'].includes(name)) {
      setForm((prev) => ({
        ...prev,
        [name]: capitalizeWords(value),
      }))
      return
    }

    if (name === 'descripcion') {
      setForm((prev) => ({
        ...prev,
        descripcion: normalizeParagraph(value),
      }))
      return
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImagenes = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const disponibles = MAX_IMAGENES - imagenes.length

    if (disponibles <= 0) {
      setEsError(true)
      setMensaje('Ya llegaste al máximo de 5 imágenes.')
      e.target.value = ''
      return
    }

    const seleccionadas = files.slice(0, disponibles).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
    }))

    setImagenes((prev) => [...prev, ...seleccionadas])
    setEsError(false)
    setMensaje('📸 Imágenes agregadas correctamente.')
    e.target.value = ''
  }

  const quitarImagen = (id: string) => {
    setImagenes((prev) => {
      const encontrada = prev.find((img) => img.id === id)
      if (encontrada) URL.revokeObjectURL(encontrada.url)
      return prev.filter((img) => img.id !== id)
    })
  }

  const seleccionarPlan = (nextPlan: 'vip' | 'free') => {
    setMensaje('')
    setEsError(false)

    if (nextPlan === 'vip' && !puedeSeleccionarVip) {
      setEsError(true)
      setMensaje(
        `Completa primero toda la información para desbloquear VIP: ${faltantesVip.join(', ')}.`
      )
      return
    }

    setPlan(nextPlan)
  }

  const subirImagenes = async () => {
    if (!user) return []

    const urls: { image_url: string; image_path: string; sort_order: number }[] = []

    for (const [index, img] of imagenes.entries()) {
      const ext = img.file.name.split('.').pop() || 'jpg'
      const path = `${user.id}/${Date.now()}-${index}.${ext}`

      const { error } = await supabase.storage
        .from('product-images')
        .upload(path, img.file, {
          contentType: img.file.type,
          upsert: true,
        })

      if (error) throw error

      const { data } = supabase.storage.from('product-images').getPublicUrl(path)

      urls.push({
        image_url: data.publicUrl,
        image_path: path,
        sort_order: index + 1,
      })
    }

    return urls
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMensaje('')
    setEsError(false)
    setSaving(true)

    try {
      if (!user) throw new Error('Debes iniciar sesión.')

      if (!puedePublicarBase) {
        throw new Error('Completa los campos principales antes de continuar.')
      }

      if (plan === 'vip' && !puedeSeleccionarVip) {
        throw new Error('El plan VIP solo se desbloquea cuando el formulario está completo.')
      }

      if (!precioNumero) throw new Error('Escribe un precio válido.')

      const estadoInicial = plan === 'vip' ? 'pending_payment' : 'published'
      const vipActivoInicial = false

      const { data: insertedProduct, error: insertError } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          nombre_producto: form.nombre_producto,
          categoria: form.categoria,
          subcategoria: form.subcategoria || null,
          descripcion: form.descripcion,
          departamento: form.departamento,
          municipio: form.municipio,
          precio: precioNumero,
          tipo_venta: form.tipo_venta,
          nombre_vendedor: form.nombre_vendedor,
          telefono: onlyDigits(form.telefono),
          whatsapp: onlyDigits(form.whatsapp || form.telefono),
          plan,
          vip_activo: vipActivoInicial,
          estado: estadoInicial,
          published_at: plan === 'free' ? new Date().toISOString() : null,
          allow_call: onlyDigits(form.telefono).length >= 7,
          allow_whatsapp: onlyDigits(form.whatsapp || form.telefono).length >= 7,
        })
        .select()
        .single()

      if (insertError) throw insertError

      const imagenesSubidas = await subirImagenes()

      if (imagenesSubidas.length > 0) {
        const payload = imagenesSubidas.map((img) => ({
          product_id: insertedProduct.id,
          user_id: user.id,
          image_url: img.image_url,
          image_path: img.image_path,
          sort_order: img.sort_order,
        }))

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(payload)

        if (imagesError) throw imagesError
      }

      if (plan === 'vip') {
        const { error: vipError } = await supabase.from('vip_payments').insert({
          user_id: user.id,
          product_id: insertedProduct.id,
          plan: 'vip',
          amount: 7900,
          currency: 'COP',
          payment_status: 'pending',
          provider: 'mercado_pago',
        })

        if (vipError) throw vipError

        setEsError(false)
        setMensaje(
          'Tu publicación quedó creada en espera de pago. Solo aparecerá como VIP cuando Mercado Pago confirme el pago.'
        )

        window.location.assign(MERCADO_PAGO_VIP)
        return
      }

      router.push('/perfil?publicado=1')
    } catch (err: any) {
      setEsError(true)
      setMensaje(err.message || 'No se pudo guardar la publicación.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main style={s.page}>
        <div style={s.wrap}>
          <div style={s.card}>Cargando publicación...</div>
        </div>
      </main>
    )
  }

  return (
    <main style={s.page}>
      <style jsx global>{`
        .publish-layout {
          display: grid;
          gap: 16px;
        }

        .publish-side {
          display: grid;
          gap: 16px;
        }

        .summary-sticky {
          position: sticky;
          top: 12px;
        }

        .hero-float-chip {
          animation: chipFloat 4.5s ease-in-out infinite;
        }

        .hero-float-chip:nth-child(2) {
          animation-delay: 0.6s;
        }

        .hero-float-chip:nth-child(3) {
          animation-delay: 1.1s;
        }

        .hero-float-chip:nth-child(4) {
          animation-delay: 1.5s;
        }

        .shine-frame {
          position: relative;
          overflow: hidden;
        }

        .shine-frame::before {
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
          animation: shineMove 5.2s linear infinite;
          pointer-events: none;
        }

        .plan-grid-enhanced {
          display: grid;
          gap: 12px;
        }

        .upload-grid-enhanced {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 12px;
        }

        .preview-counter {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 11px;
          border-radius: 999px;
          background: #ecfdf5;
          color: #166534;
          border: 1px solid #bbf7d0;
          font-size: 12px;
          font-weight: 800;
          margin-top: 10px;
        }

        .vip-ready-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 900;
          border: 1px solid transparent;
        }

        .vip-ready-pill.ok {
          background: #ecfdf5;
          color: #166534;
          border-color: #bbf7d0;
        }

        .vip-ready-pill.locked {
          background: #f3f4f6;
          color: #374151;
          border-color: #e5e7eb;
        }

        .mini-stat-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .mini-summary-box {
          border-radius: 18px;
          border: 1px solid #e5e7eb;
          background: #f8fafc;
          padding: 14px;
        }

        .mini-summary-value {
          font-size: 24px;
          font-weight: 900;
          color: #14532d;
          margin-bottom: 4px;
        }

        .mini-summary-label {
          font-size: 12px;
          color: #4b5563;
          font-weight: 700;
          line-height: 1.5;
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

        @keyframes chipFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes shineMove {
          0% { transform: translateX(-130%); }
          100% { transform: translateX(130%); }
        }

        @media (min-width: 900px) {
          .publish-layout {
            grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.85fr);
            align-items: start;
          }

          .publish-row-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .plan-grid-enhanced {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>

      <div style={s.wrap}>
        <section style={s.hero} className="shine-frame">
          <div style={s.heroGlow} />

          <div style={s.heroContent}>
            <h1 style={s.heroTitle}>Haz que tu producto se vea irresistible ✨</h1>
            <p style={s.heroText}>
              Súbelo con una experiencia más seria, más atractiva y mejor pensada para vender de verdad.
            </p>

            <div style={s.heroBadgesWrap}>
              <span style={s.heroBadge} className="hero-float-chip">
                🔒 VIP bloqueado hasta completar todo
              </span>
              <span style={s.heroBadge} className="hero-float-chip">
                ✅ Publicación clara y rápida
              </span>
              <span style={s.heroBadge} className="hero-float-chip">
                📸 Fotos que generan confianza
              </span>
              <span style={s.heroBadge} className="hero-float-chip">
                💳 VIP solo cuando Mercado Pago confirme
              </span>
            </div>

            <div style={s.topActions}>
              <Link href="/" style={{ ...s.topBtn, ...s.topBtnLight }}>
                🏠 Volver al inicio
              </Link>

              <Link href="/catalogo" style={{ ...s.topBtn, ...s.topBtnGhost }}>
                Ver catálogo
              </Link>

              <Link href="/perfil" style={{ ...s.topBtn, ...s.topBtnGhost }}>
                Ir a mi perfil
              </Link>
            </div>

            <div style={s.liveGrid}>
              <div style={s.liveCard}>
                <div style={s.liveLabel}>Avance</div>
                <div style={s.liveValue}>{progreso}%</div>
              </div>

              <div style={s.liveCard}>
                <div style={s.liveLabel}>Imágenes</div>
                <div style={s.liveValue}>
                  {imagenes.length}/{MAX_IMAGENES}
                </div>
              </div>

              <div style={s.liveCard}>
                <div style={s.liveLabel}>Plan activo</div>
                <div style={s.liveValue}>{plan === 'vip' ? 'VIP' : 'Gratis'}</div>
              </div>

              <div style={s.liveCard}>
                <div style={s.liveLabel}>Estado VIP</div>
                <div style={s.liveValue}>{puedeSeleccionarVip ? 'Listo' : 'Bloq.'}</div>
              </div>
            </div>
          </div>
        </section>

        <div className="publish-layout">
          <section style={s.card}>
            <h2 style={s.title}>Formulario de publicación</h2>
            <p style={s.text}>
              Primero completas bien la publicación y solo después se desbloquea la opción VIP.
            </p>

            <div style={s.progressPill}>⚡ Avance del formulario: {progreso}%</div>

            <div style={s.progressBar}>
              <div style={{ ...s.progressFill, width: `${progreso}%` }} />
            </div>

            <div style={s.checklistBox}>
              <h3 style={s.checklistTitle}>Checklist para desbloquear VIP</h3>

              <div style={s.checklistGrid}>
                {requisitosVip.map((item) => (
                  <div
                    key={item.label}
                    style={{
                      ...s.checklistItem,
                      ...(item.ok
                        ? { background: '#ecfdf5', color: '#166534', border: '1px solid #bbf7d0' }
                        : { background: '#f8fafc', color: '#4b5563', border: '1px solid #e5e7eb' }),
                    }}
                  >
                    <span>{item.ok ? '✅' : '⏳'}</span>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.field}>
                <label style={s.label}>Nombre del producto</label>
                <input
                  name="nombre_producto"
                  value={form.nombre_producto}
                  onChange={handleTextChange}
                  placeholder="Ej: Papa Criolla Premium"
                  style={s.input}
                />
              </div>

              <div style={s.row2} className="publish-row-2">
                <div style={s.field}>
                  <label style={s.label}>Nombre del vendedor o finca</label>
                  <input
                    name="nombre_vendedor"
                    value={form.nombre_vendedor}
                    onChange={handleTextChange}
                    placeholder="Ej: Finca La Esperanza"
                    style={s.input}
                  />
                </div>

                <div style={s.field}>
                  <label style={s.label}>Categoría</label>
                  <select
                    name="categoria"
                    value={form.categoria}
                    onChange={handleSelectChange}
                    style={s.input}
                  >
                    {categorias.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={s.row2} className="publish-row-2">
                <div style={s.field}>
                  <label style={s.label}>Subcategoría</label>
                  <input
                    name="subcategoria"
                    value={form.subcategoria}
                    onChange={handleTextChange}
                    placeholder="Ej: Papa Lavada"
                    style={s.input}
                  />
                </div>

                <div style={s.field}>
                  <label style={s.label}>Tipo de venta</label>
                  <select
                    name="tipo_venta"
                    value={form.tipo_venta}
                    onChange={handleSelectChange}
                    style={s.input}
                  >
                    {tiposVenta.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={s.row2} className="publish-row-2">
                <div style={s.field}>
                  <label style={s.label}>Departamento</label>
                  <select
                    name="departamento"
                    value={form.departamento}
                    onChange={handleSelectChange}
                    style={s.input}
                  >
                    {departamentos.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div style={s.field}>
                  <label style={s.label}>Municipio</label>
                  <input
                    name="municipio"
                    value={form.municipio}
                    onChange={handleTextChange}
                    placeholder="Ej: Fusagasugá"
                    style={s.input}
                  />
                </div>
              </div>

              <div style={s.row2} className="publish-row-2">
                <div style={s.field}>
                  <label style={s.label}>Precio</label>
                  <input
                    name="precio"
                    value={form.precio}
                    onChange={handleTextChange}
                    inputMode="numeric"
                    placeholder="$100.000"
                    style={s.input}
                  />
                  <p style={s.help}>
                    Escribe números y el sistema lo acomoda automáticamente en pesos colombianos.
                  </p>
                </div>

                <div style={s.field}>
                  <label style={s.label}>Teléfono</label>
                  <input
                    name="telefono"
                    value={form.telefono}
                    onChange={handleTextChange}
                    inputMode="numeric"
                    placeholder="3001234567"
                    style={s.input}
                  />
                </div>
              </div>

              <div style={s.row2} className="publish-row-2">
                <div style={s.field}>
                  <label style={s.label}>WhatsApp</label>
                  <input
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={handleTextChange}
                    inputMode="numeric"
                    placeholder="3001234567"
                    style={s.input}
                  />
                </div>

                <div style={s.field}>
                  <label style={s.label}>Contacto rápido</label>
                  <div
                    style={{
                      minHeight: '54px',
                      borderRadius: '14px',
                      border: '1px solid #d1d5db',
                      padding: '0 14px',
                      display: 'flex',
                      alignItems: 'center',
                      background: '#f9fafb',
                      color: '#4b5563',
                      fontSize: '14px',
                      fontWeight: 700,
                    }}
                  >
                    {onlyDigits(form.whatsapp || form.telefono) || 'Aún sin número válido'}
                  </div>
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Descripción</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleTextChange}
                  placeholder="Ej: Producto fresco, buena calidad y entrega inmediata."
                  style={s.textarea}
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>Imágenes del producto</label>

                <div style={s.imageUploadBox}>
                  <p style={s.help}>
                    Sube hasta 5 imágenes. Para desbloquear VIP debe haber al menos 1 imagen.
                  </p>

                  <input
                    ref={inputImagenesRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagenes}
                    style={{ display: 'none' }}
                  />

                  <button
                    type="button"
                    onClick={() => inputImagenesRef.current?.click()}
                    style={s.uploadBtn}
                  >
                    ➕ Subir imágenes
                  </button>

                  <div className="preview-counter">
                    📸 {imagenes.length}/{MAX_IMAGENES} imágenes cargadas
                  </div>

                  {imagenes.length > 0 ? (
                    <div style={s.previewGrid} className="upload-grid-enhanced">
                      {imagenes.map((img, index) => (
                        <div key={img.id} style={s.previewCard}>
                          <img
                            src={img.url}
                            alt={`Vista previa ${index + 1}`}
                            style={s.previewImage}
                          />
                          <div style={s.previewFooter}>
                            <button
                              type="button"
                              onClick={() => quitarImagen(img.id)}
                              style={s.removeBtn}
                            >
                              Quitar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <div style={s.label}>Plan de publicación</div>

                <div style={s.plans} className="plan-grid-enhanced">
                  <div
                    style={{
                      ...s.planCard,
                      ...(puedeSeleccionarVip ? s.planVip : s.planLocked),
                      ...(plan === 'vip' ? s.planSelected : {}),
                    }}
                    onClick={() => seleccionarPlan('vip')}
                  >
                    <div style={s.planHeader}>
                      <div style={s.planTitle}>👑 VIP PREMIUM</div>

                      {puedeSeleccionarVip ? (
                        <span className="vip-ready-pill ok">Desbloqueado</span>
                      ) : (
                        <span className="vip-ready-pill locked">Bloqueado</span>
                      )}
                    </div>

                    <div style={s.planHeader}>
                      <span style={{ ...s.badge, ...s.badgeVip }}>$7.900</span>
                      <span style={{ ...s.badge, ...(puedeSeleccionarVip ? s.badgeVip : s.badgeLock) }}>
                        {plan === 'vip' ? 'Seleccionado' : 'Elegir'}
                      </span>
                    </div>

                    <div style={s.benefits}>
                      <div style={s.benefit}>🚀 Más visibilidad dentro del catálogo.</div>
                      <div style={s.benefit}>⭐ Etiqueta destacada de VIP PREMIUM.</div>
                      <div style={s.benefit}>📲 Prioridad para contacto por WhatsApp y llamada.</div>
                      <div style={s.benefit}>💛 Más confianza para quien compra.</div>
                    </div>

                    {puedeSeleccionarVip ? (
                      <div style={s.trustBox}>
                        🔒 Al enviar, primero se crea la publicación en espera y solo se activa como VIP cuando Mercado Pago confirme el pago.
                      </div>
                    ) : (
                      <div style={s.lockedBox}>
                        🔐 Este plan no se puede abrir todavía. Completa todos los puntos del checklist, incluyendo WhatsApp e imágenes.
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => seleccionarPlan('vip')}
                      disabled={!puedeSeleccionarVip}
                      style={{
                        ...s.smallPlanBtn,
                        ...(puedeSeleccionarVip ? s.btnGold : s.btnDisabled),
                      }}
                    >
                      {puedeSeleccionarVip ? 'Elegir VIP PREMIUM' : 'Completa todo para desbloquear VIP'}
                    </button>
                  </div>

                  <div
                    style={{
                      ...s.planCard,
                      ...(plan === 'free' ? s.planSelected : {}),
                    }}
                    onClick={() => seleccionarPlan('free')}
                  >
                    <div style={s.planHeader}>
                      <div style={s.planTitle}>Publicación sin costo</div>
                      <span style={{ ...s.badge, ...s.badgeFree }}>Gratis</span>
                    </div>

                    <div style={s.benefits}>
                      <div style={s.benefit}>✅ Publica sin pagar.</div>
                      <div style={s.benefit}>✅ Ideal para empezar.</div>
                      <div style={s.benefit}>✅ Sale normal en la plataforma cuando guardas.</div>
                    </div>

                    <div style={s.lockedBox}>
                      Esta opción sí puede publicarse directamente cuando estén listos los campos principales.
                    </div>

                    <button
                      type="button"
                      onClick={() => seleccionarPlan('free')}
                      style={{
                        ...s.smallPlanBtn,
                        ...s.btnGreen,
                      }}
                    >
                      {plan === 'free' ? 'Plan actual' : 'Elegir publicación gratis'}
                    </button>
                  </div>
                </div>
              </div>

              <div style={s.actions}>
                <button
                  type="submit"
                  disabled={saving || (plan === 'free' ? !puedePublicarBase : !puedeSeleccionarVip)}
                  style={{
                    ...s.btn,
                    ...(saving
                      ? s.btnDisabled
                      : plan === 'vip'
                      ? s.btnGold
                      : s.btnGreen),
                    ...(plan === 'free'
                      ? !puedePublicarBase
                        ? s.btnDisabled
                        : {}
                      : !puedeSeleccionarVip
                      ? s.btnDisabled
                      : {}),
                  }}
                >
                  {saving
                    ? 'Guardando...'
                    : plan === 'vip'
                    ? '✨ Crear publicación y continuar al pago VIP'
                    : '✅ Publicar gratis'}
                </button>

                <Link href="/" style={{ ...s.btn, ...s.btnWhite }}>
                  🏠 Volver al inicio
                </Link>
              </div>
            </form>

            {mensaje ? (
              <div style={esError ? s.error : s.success}>{mensaje}</div>
            ) : null}
          </section>

          <aside className="publish-side">
            <div style={s.summaryCard} className="summary-sticky">
              <h3 style={s.summaryTitle}>Resumen en vivo</h3>

              <div className="mini-stat-grid">
                <div className="mini-summary-box">
                  <div className="mini-summary-value">{progreso}%</div>
                  <div className="mini-summary-label">Avance total</div>
                </div>

                <div className="mini-summary-box">
                  <div className="mini-summary-value">{imagenes.length}</div>
                  <div className="mini-summary-label">Fotos subidas</div>
                </div>

                <div className="mini-summary-box">
                  <div className="mini-summary-value">
                    {resumen.precio
                      ? new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          maximumFractionDigits: 0,
                        }).format(resumen.precio)
                      : '$ 0'}
                  </div>
                  <div className="mini-summary-label">Precio listo</div>
                </div>

                <div className="mini-summary-box">
                  <div className="mini-summary-value">{plan === 'vip' ? 'VIP' : 'FREE'}</div>
                  <div className="mini-summary-label">Plan seleccionado</div>
                </div>
              </div>

              <div
                style={{
                  marginTop: '14px',
                  borderRadius: '18px',
                  border: '1px solid #e5e7eb',
                  background: '#f8fafc',
                  padding: '14px',
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 900,
                    color: '#111827',
                    marginBottom: '8px',
                  }}
                >
                  Estado del VIP
                </div>

                <div className={`vip-ready-pill ${puedeSeleccionarVip ? 'ok' : 'locked'}`}>
                  {puedeSeleccionarVip
                    ? 'VIP desbloqueado y listo para pago'
                    : 'VIP todavía bloqueado'}
                </div>

                {!puedeSeleccionarVip ? (
                  <p style={{ ...s.help, marginTop: '10px' }}>
                    Faltan: {faltantesVip.join(', ')}.
                  </p>
                ) : (
                  <p style={{ ...s.help, marginTop: '10px' }}>
                    Al guardar con VIP, tu publicación queda pendiente y no aparece como VIP hasta la confirmación del pago.
                  </p>
                )}
              </div>

              <div
                style={{
                  marginTop: '14px',
                  borderRadius: '18px',
                  border: '1px solid #e5e7eb',
                  background: '#fff7ed',
                  padding: '14px',
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 900,
                    color: '#9a3412',
                    marginBottom: '8px',
                  }}
                >
                  Regla de seguridad VIP
                </div>

                <p style={{ ...s.help, color: '#9a3412' }}>
                  No hay enlace directo a Mercado Pago desde la tarjeta. El acceso al pago solo sucede al enviar el formulario completo con VIP habilitado.
                </p>
              </div>

              <div
                style={{
                  marginTop: '14px',
                  borderRadius: '18px',
                  border: '1px solid #e5e7eb',
                  background: '#ecfdf5',
                  padding: '14px',
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 900,
                    color: '#166534',
                    marginBottom: '8px',
                  }}
                >
                  Vista del vendedor
                </div>

                <div style={{ ...s.help, color: '#166534' }}>
                  {form.nombre_producto || 'Tu producto aparecerá aquí'}
                </div>
                <div style={{ ...s.help, color: '#166534', marginTop: '6px' }}>
                  {form.nombre_vendedor || 'Tu finca o negocio'}
                </div>
                <div style={{ ...s.help, color: '#166534', marginTop: '6px' }}>
                  {form.municipio || 'Municipio'} · {form.departamento}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}