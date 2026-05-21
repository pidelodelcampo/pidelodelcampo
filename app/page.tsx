'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'

const categorias = [
  { nombre: 'Frutas', emoji: '🍊' },
  { nombre: 'Verduras', emoji: '🥬' },
  { nombre: 'Hortalizas', emoji: '🌿' },
  { nombre: 'Tubérculos', emoji: '🥔' },
  { nombre: 'Lácteos', emoji: '🥛' },
  { nombre: 'Porcinos', emoji: '🐖' },
  { nombre: 'Bovinos', emoji: '🐄' },
  { nombre: 'Aves', emoji: '🐔' },
]

const resenasIniciales = [
  {
    nombre: 'María Torres',
    lugar: 'Tunja',
    texto: 'La página se entiende rápido y desde el celular pude encontrar lo que buscaba sin enredarme.',
  },
  {
    nombre: 'José Ramírez',
    lugar: 'Villavicencio',
    texto: 'Me gusta que catálogo, perfil e ingresar estén claros. Eso genera más confianza.',
  },
  {
    nombre: 'Ana Milena',
    lugar: 'La Unión',
    texto: 'Se ve limpia, seria y con opciones útiles para comprar o publicar.',
  },
]

const comentariosIniciales = [
  {
    nombre: 'Elkin',
    ciudad: 'Pasto',
    mensaje: 'Se ve confiable. Sería bueno seguir mostrando más productos nuevos.',
    tiempo: 'Hace 2 horas',
  },
  {
    nombre: 'Rosa María',
    ciudad: 'Ibagué',
    mensaje: 'Me gusta que publicar e ingresar estén tan visibles.',
    tiempo: 'Hoy',
  },
]

const proveedoresDestacados = [
  {
    nombre: 'Finca Los Naranjos',
    categoria: 'Frutas',
    ciudad: 'La Unión, Valle',
    imagen:
      'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=1200&q=80',
    precio: '$ 48.000',
    detalle: 'Naranja, mandarina y limón fresco.',
    vip: true,
  },
  {
    nombre: 'Aguacates Don Pedro',
    categoria: 'Frutas',
    ciudad: 'Sonsón, Antioquia',
    imagen:
      'https://images.unsplash.com/photo-1601039641847-7857b994d704?auto=format&fit=crop&w=1200&q=80',
    precio: '$ 4.500 / kilo',
    detalle: 'Aguacate Hass con cosecha continua.',
    vip: true,
  },
  {
    nombre: 'Frutales Santa Rosa',
    categoria: 'Frutas',
    ciudad: 'Pereira, Risaralda',
    imagen:
      'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=1200&q=80',
    precio: '$ 39.000',
    detalle: 'Piña y papaya para compra directa.',
    vip: false,
  },
  {
    nombre: 'Huerta El Progreso',
    categoria: 'Verduras',
    ciudad: 'Mosquera, Cundinamarca',
    imagen:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
    precio: '$ 28.000',
    detalle: 'Lechuga, cebolla y cilantro.',
    vip: false,
  },
  {
    nombre: 'Verde Andino',
    categoria: 'Verduras',
    ciudad: 'Tunja, Boyacá',
    imagen:
      'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=1200&q=80',
    precio: '$ 32.000',
    detalle: 'Brócoli y hortaliza fresca.',
    vip: true,
  },
  {
    nombre: 'Cosecha Campesina',
    categoria: 'Verduras',
    ciudad: 'Pasto, Nariño',
    imagen:
      'https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=1200&q=80',
    precio: '$ 26.000',
    detalle: 'Zanahoria y remolacha.',
    vip: false,
  },
  {
    nombre: 'Campo Fresco SAS',
    categoria: 'Hortalizas',
    ciudad: 'Rionegro, Antioquia',
    imagen:
      'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=1200&q=80',
    precio: '$ 35.000',
    detalle: 'Pimentón, pepino y ají.',
    vip: true,
  },
  {
    nombre: 'Sembrados El Molino',
    categoria: 'Hortalizas',
    ciudad: 'Villa de Leyva, Boyacá',
    imagen:
      'https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?auto=format&fit=crop&w=1200&q=80',
    precio: '$ 31.000',
    detalle: 'Hierbas, aromáticas y más.',
    vip: false,
  },
  {
    nombre: 'Papa Boyacense Ruiz',
    categoria: 'Tubérculos',
    ciudad: 'Sogamoso, Boyacá',
    imagen:
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1200&q=80',
    precio: '$ 85.000',
    detalle: 'Papa criolla y sabanera.',
    vip: true,
  },
  {
    nombre: 'Yuca Llanera',
    categoria: 'Tubérculos',
    ciudad: 'Puerto López, Meta',
    imagen:
      'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?auto=format&fit=crop&w=1200&q=80',
    precio: '$ 52.000',
    detalle: 'Yuca fresca por bulto.',
    vip: false,
  },
  {
    nombre: 'Lácteos La Pradera',
    categoria: 'Lácteos',
    ciudad: 'Ubaté, Cundinamarca',
    imagen:
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1200&q=80',
    precio: '$ 18.000',
    detalle: 'Leche, queso y derivados.',
    vip: true,
  },
  {
    nombre: 'Quesera San Miguel',
    categoria: 'Lácteos',
    ciudad: 'Paipa, Boyacá',
    imagen:
      'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=1200&q=80',
    precio: '$ 22.000',
    detalle: 'Queso campesino y doble crema.',
    vip: false,
  },
  {
    nombre: 'Porcícola El Descanso',
    categoria: 'Porcinos',
    ciudad: 'Cali, Valle',
    imagen:
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=80',
    precio: 'Consultar',
    detalle: 'Venta de porcinos y lotes.',
    vip: true,
  },
  {
    nombre: 'Ganados El Triunfo',
    categoria: 'Bovinos',
    ciudad: 'Montería, Córdoba',
    imagen:
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&q=80',
    precio: 'Consultar',
    detalle: 'Bovinos y ganado de levante.',
    vip: true,
  },
  {
    nombre: 'Pollos del Campo',
    categoria: 'Aves',
    ciudad: 'Ibagué, Tolima',
    imagen:
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1200&q=80',
    precio: '$ 21.000',
    detalle: 'Pollo campesino y huevos.',
    vip: true,
  },
  {
    nombre: 'Huevos El Amanecer',
    categoria: 'Aves',
    ciudad: 'Palmira, Valle',
    imagen:
      'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=1200&q=80',
    precio: '$ 16.000',
    detalle: 'Huevos frescos por cubeta.',
    vip: false,
  },
]

const movimientos = [
  '🌱 Nuevos productores publicando hoy',
  '🚚 Más contacto directo entre comprador y proveedor',
  '👑 Publicaciones VIP con mejor visibilidad',
  '📍 Proveedores de varias regiones de Colombia',
  '💬 Comunidad activa dentro de la página',
  '📱 Experiencia pensada para celular',
]

const frasesHero = [
  'Conecta con productores reales',
  'Encuentra publicaciones destacadas',
  'Publica en minutos desde tu celular',
  'Haz crecer tu vitrina con VIP',
]

const datosEnVivo = [
  { titulo: 'Publicaciones activas', valor: '+120', color: '#166534' },
  { titulo: 'Ciudades visibles', valor: '32+', color: '#0f766e' },
  { titulo: 'Contactos rápidos', valor: '24/7', color: '#7c3aed' },
  { titulo: 'Respuesta destacada', valor: '< 1h', color: '#b45309' },
]

const FacebookIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.026 4.388 11.022 10.125 11.927v-8.437H7.078v-3.49h3.047V9.413c0-3.03 1.792-4.705 4.533-4.705 1.313 0 2.686.236 2.686.236v2.974H15.83c-1.491 0-1.956.93-1.956 1.885v2.27h3.328l-.532 3.49h-2.796V24C19.612 23.095 24 18.099 24 12.073Z"
      fill="#1877F2"
    />
    <path
      d="M16.671 15.563l.532-3.49h-3.328v-2.27c0-.955.465-1.885 1.956-1.885h1.514V4.944s-1.373-.236-2.686-.236c-2.741 0-4.533 1.675-4.533 4.705v2.66H7.078v3.49h3.047V24a12.2 12.2 0 0 0 3.75 0v-8.437h2.796Z"
      fill="white"
    />
  </svg>
)

const InstagramIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-gradient)" />
    <path d="M12 7.4A4.6 4.6 0 1 0 12 16.6A4.6 4.6 0 1 0 12 7.4Z" stroke="white" strokeWidth="1.8" />
    <circle cx="17.3" cy="6.7" r="1.1" fill="white" />
    <rect x="6" y="6" width="12" height="12" rx="4" stroke="white" strokeWidth="1.8" />
    <defs>
      <linearGradient id="ig-gradient" x1="3" y1="21" x2="21" y2="3" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F58529" />
        <stop offset="0.35" stopColor="#FEDA77" />
        <stop offset="0.6" stopColor="#DD2A7B" />
        <stop offset="0.8" stopColor="#8134AF" />
        <stop offset="1" stopColor="#515BD4" />
      </linearGradient>
    </defs>
  </svg>
)

const WhatsAppIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M20.52 3.48A11.78 11.78 0 0 0 12.1 0C5.54 0 .18 5.34.18 11.92c0 2.1.55 4.16 1.59 5.97L0 24l6.28-1.65a11.86 11.86 0 0 0 5.82 1.49h.01c6.56 0 11.91-5.35 11.91-11.92c0-3.18-1.24-6.17-3.5-8.44Z"
      fill="#25D366"
    />
    <path
      d="M10.09 6.23c-.23-.5-.47-.51-.69-.52c-.18-.01-.38-.01-.59-.01c-.2 0-.53.08-.81.38c-.28.3-1.07 1.04-1.07 2.54s1.09 2.95 1.24 3.15c.15.2 2.13 3.43 5.27 4.67c2.6 1.03 3.14.83 3.7.78c.56-.05 1.81-.74 2.07-1.45c.25-.71.25-1.31.18-1.45c-.08-.13-.28-.2-.59-.35c-.3-.15-1.81-.89-2.09-.99c-.28-.1-.48-.15-.68.15c-.2.3-.78.99-.96 1.19c-.18.2-.36.23-.66.08c-.3-.15-1.28-.47-2.44-1.49c-.9-.8-1.5-1.79-1.68-2.09c-.18-.3-.02-.47.13-.62c.13-.13.3-.35.46-.53c.15-.18.2-.3.3-.5c.1-.2.05-.38-.02-.53c-.08-.15-.68-1.75-.95-2.33Z"
      fill="white"
    />
  </svg>
)

const TikTokIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect width="24" height="24" rx="6" fill="#111111" />
    <path
      d="M14.66 5c.43 1.23 1.16 2.17 2.44 2.93c.73.43 1.52.67 2.24.74v2.56c-1.18-.04-2.28-.34-3.29-.92v4.45c0 3.33-2.46 5.24-5.16 5.24c-2.64 0-4.89-1.92-4.89-4.78c0-2.98 2.37-4.84 4.95-4.84c.28 0 .52.02.75.06v2.67a2.57 2.57 0 0 0-.77-.11c-1.28 0-2.31.84-2.31 2.06c0 1.18.89 2.05 2.12 2.05c1.47 0 2.16-1.03 2.16-2.55V5h2.76Z"
      fill="white"
    />
  </svg>
)

const YouTubeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="1.5" y="4.5" width="21" height="15" rx="4" fill="#FF0000" />
    <path d="M10 9L16 12L10 15V9Z" fill="white" />
  </svg>
)

const TelegramIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="12" fill="#27A7E7" />
    <path
      d="M17.55 7.65L5.96 12.11c-.79.32-.79.76-.14.96l2.98.93l1.15 3.71c.14.38.07.53.47.53c.31 0 .45-.14.62-.31l1.45-1.41l3.02 2.23c.56.31.96.15 1.1-.52l1.97-9.29c.2-.82-.31-1.19-.93-.93Z"
      fill="white"
    />
  </svg>
)

const XIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect width="24" height="24" rx="6" fill="#111111" />
    <path d="M14.15 10.17L20.6 3H19.1l-5.62 6.24L8.99 3H3.9l6.77 9.45L3.9 21h1.5l5.94-6.6l4.73 6.6h5.09l-7.01-9.83Z" fill="white" />
  </svg>
)

const LinkedInIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect width="24" height="24" rx="4" fill="#0A66C2" />
    <path d="M7.05 8.74a1.53 1.53 0 1 0 0-3.06a1.53 1.53 0 0 0 0 3.06ZM5.72 9.95h2.66V18H5.72V9.95ZM10.05 9.95h2.55v1.1h.04c.35-.67 1.22-1.38 2.5-1.38c2.67 0 3.16 1.76 3.16 4.04V18h-2.66v-3.8c0-.9-.02-2.07-1.26-2.07c-1.26 0-1.45.98-1.45 2v3.87h-2.66V9.95Z" fill="white" />
  </svg>
)

const PinterestIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="12" fill="#E60023" />
    <path
      d="M12.75 17.96c-.95 0-1.84-.5-2.15-1.08l-.59 2.24c-.21.81-.78 1.82-1.16 2.44c-.12.19-.38.06-.36-.16c.03-.38.27-1.74.54-2.89c.14-.61.95-4.03.95-4.03s-.24-.48-.24-1.18c0-1.1.64-1.92 1.43-1.92c.67 0 1 .51 1 1.12c0 .68-.43 1.7-.66 2.64c-.19.79.4 1.43 1.17 1.43c1.4 0 2.34-1.8 2.34-3.93c0-1.62-1.09-2.83-3.08-2.83c-2.24 0-3.63 1.67-3.63 3.53c0 .64.19 1.09.48 1.44c.14.16.16.23.11.42c-.04.14-.12.48-.16.62c-.05.2-.19.27-.38.19c-1.06-.43-1.55-1.58-1.55-2.88c0-2.15 1.81-4.73 5.4-4.73c2.89 0 4.79 2.09 4.79 4.34c0 2.97-1.65 5.18-4.08 5.18Z"
      fill="white"
    />
  </svg>
)

const ThreadsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect width="24" height="24" rx="6" fill="#111111" />
    <path
      d="M15.92 11.36c-.12-.06-.24-.12-.37-.17c-.07-1.16-.39-2.04-.98-2.68c-.7-.75-1.77-1.13-3.2-1.13c-2.47 0-4.14 1.39-4.14 3.46c0 1.64 1.03 2.85 2.67 3.15l.02.01c.71.13 1.51.19 2.41.19c.56 0 1.14-.03 1.72-.08c-.18 1.17-.89 1.84-2.07 1.84c-.93 0-1.53-.36-1.84-1.1H7.62c.27 2.03 1.88 3.22 4.39 3.22c2.82 0 4.6-1.63 4.6-4.21c0-1.09-.21-1.92-.69-2.5Zm-3.58.51c-.64 0-1.2-.03-1.66-.1c-.72-.11-1.09-.5-1.09-1.15c0-.85.67-1.4 1.71-1.4c1.2 0 1.84.57 2.02 1.8c-.33.03-.66.05-.98.05Z"
      fill="white"
    />
  </svg>
)

const SnapchatIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect width="24" height="24" rx="6" fill="#FFFC00" />
    <path
      d="M12 4.2c1.9 0 3.42 1.52 3.42 3.4v1.13c0 .26.08.5.22.7c.18.27.45.54.82.73c.28.14.53.28.53.61c0 .31-.28.51-.65.62c-.27.08-.41.28-.46.48c-.14.58-.54 1.08-1.14 1.41c-.33.18-.43.44-.46.7c-.06.47-.43.85-.9.85h-1.76c-.47 0-.84-.38-.9-.85c-.03-.26-.13-.52-.46-.7c-.6-.33-1-.83-1.14-1.41c-.05-.2-.19-.4-.46-.48c-.37-.11-.65-.31-.65-.62c0-.33.25-.47.53-.61c.37-.19.64-.46.82-.73c.14-.2.22-.44.22-.7V7.6c0-1.88 1.52-3.4 3.42-3.4Z"
      fill="white"
      stroke="#111111"
      strokeWidth="0.8"
    />
  </svg>
)

const MessengerIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 0C5.37 0 0 4.97 0 11.1c0 3.49 1.74 6.6 4.46 8.63V24l4.06-2.22c1.08.3 2.23.47 3.48.47c6.63 0 12-4.97 12-11.1S18.63 0 12 0Z"
      fill="url(#ms-gradient)"
    />
    <path d="M4.8 15.74l4.06-4.3l2.85 2.43l4.05-4.3l-4.47 6.05l-2.85-2.43l-3.64 2.55Z" fill="white" />
    <defs>
      <linearGradient id="ms-gradient" x1="3" y1="22" x2="21" y2="2" gradientUnits="userSpaceOnUse">
        <stop stopColor="#006AFF" />
        <stop offset="1" stopColor="#00C6FF" />
      </linearGradient>
    </defs>
  </svg>
)

const redesSociales = [
  { nombre: 'Facebook', href: 'https://facebook.com', icono: <FacebookIcon /> },
  { nombre: 'Instagram', href: 'https://instagram.com', icono: <InstagramIcon /> },
  { nombre: 'WhatsApp', href: 'https://wa.me/573001234567', icono: <WhatsAppIcon /> },
  { nombre: 'TikTok', href: 'https://tiktok.com', icono: <TikTokIcon /> },
  { nombre: 'YouTube', href: 'https://youtube.com', icono: <YouTubeIcon /> },
  { nombre: 'Telegram', href: 'https://telegram.org', icono: <TelegramIcon /> },
  { nombre: 'X', href: 'https://x.com', icono: <XIcon /> },
  { nombre: 'LinkedIn', href: 'https://linkedin.com', icono: <LinkedInIcon /> },
  { nombre: 'Pinterest', href: 'https://pinterest.com', icono: <PinterestIcon /> },
  { nombre: 'Threads', href: 'https://threads.net', icono: <ThreadsIcon /> },
  { nombre: 'Snapchat', href: 'https://snapchat.com', icono: <SnapchatIcon /> },
  { nombre: 'Messenger', href: 'https://messenger.com', icono: <MessengerIcon /> },
]

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loadingPublish, setLoadingPublish] = useState(false)

  const [comentarios, setComentarios] = useState(comentariosIniciales)
  const [chatNombre, setChatNombre] = useState('')
  const [chatCiudad, setChatCiudad] = useState('')
  const [chatMensaje, setChatMensaje] = useState('')

  const [calcCantidad, setCalcCantidad] = useState('10')
  const [calcPrecio, setCalcPrecio] = useState('2500')
  const [calcFlete, setCalcFlete] = useState('15000')

  const [fraseIndex, setFraseIndex] = useState(0)
  const [resplandor, setResplandor] = useState({ x: 50, y: 50 })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setFraseIndex((prev) => (prev + 1) % frasesHero.length)
    }, 2600)

    return () => clearInterval(interval)
  }, [])

  const handlePublish = async () => {
    setLoadingPublish(true)

    const { data, error } = await supabase.auth.getSession()

    if (error || !data.session) {
      setLoadingPublish(false)
      router.push('/ingresar?next=/publicar')
      return
    }

    setLoadingPublish(false)
    router.push('/publicar')
  }

  const handleEnviarComentario = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const nombre = chatNombre.trim()
    const ciudad = chatCiudad.trim()
    const mensaje = chatMensaje.trim()

    if (!nombre || !ciudad || !mensaje) return

    setComentarios((prev) => [
      {
        nombre,
        ciudad,
        mensaje,
        tiempo: 'Ahora mismo',
      },
      ...prev,
    ])

    setChatNombre('')
    setChatCiudad('')
    setChatMensaje('')
  }

  const subtotal = useMemo(() => {
    return (Number(calcCantidad) || 0) * (Number(calcPrecio) || 0)
  }, [calcCantidad, calcPrecio])

  const total = useMemo(() => {
    return subtotal + (Number(calcFlete) || 0)
  }, [subtotal, calcFlete])

  const sugerido = useMemo(() => {
    return Math.round(total * 1.18)
  }, [total])

  const money = (value: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value)

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setResplandor({ x, y })
  }

  return (
    <main className={styles.page}>
      <style jsx global>{`
        .hero-innovation {
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }

        .hero-innovation::before {
          content: '';
          position: absolute;
          inset: -10%;
          background:
            radial-gradient(circle at ${resplandor.x}% ${resplandor.y}%, rgba(255,255,255,0.28), transparent 22%),
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), transparent 18%),
            radial-gradient(circle at 80% 30%, rgba(255,255,255,0.1), transparent 18%);
          z-index: 0;
          transition: background 180ms ease;
          pointer-events: none;
        }

        .hero-content-layer {
          position: relative;
          z-index: 1;
        }

        .floating-chip {
          animation: floatChip 4.5s ease-in-out infinite;
        }

        .floating-chip:nth-child(2) {
          animation-delay: 0.6s;
        }

        .floating-chip:nth-child(3) {
          animation-delay: 1.1s;
        }

        .floating-chip:nth-child(4) {
          animation-delay: 1.6s;
        }

        .floating-orb {
          position: absolute;
          border-radius: 999px;
          filter: blur(12px);
          opacity: 0.18;
          z-index: 0;
          pointer-events: none;
          animation: orbFloat 8s ease-in-out infinite;
        }

        .floating-orb.one {
          width: 130px;
          height: 130px;
          top: 12%;
          right: 8%;
          background: #ffffff;
        }

        .floating-orb.two {
          width: 90px;
          height: 90px;
          bottom: 12%;
          left: 6%;
          background: #bef264;
          animation-delay: 1.4s;
        }

        .floating-orb.three {
          width: 110px;
          height: 110px;
          top: 55%;
          right: 28%;
          background: #86efac;
          animation-delay: 2.1s;
        }

        .marquee-shell {
          margin-top: 18px;
          overflow: hidden;
          border-radius: 18px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.14);
          padding: 10px 0;
        }

        .marquee-track {
          display: flex;
          width: max-content;
          animation: marqueeMove 24s linear infinite;
        }

        .marquee-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 0 10px;
          padding: 8px 12px;
          background: rgba(255,255,255,0.9);
          color: #14532d;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .section-live-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
          margin-bottom: 28px;
        }

        .live-card {
          position: relative;
          overflow: hidden;
          background: #ffffff;
          border: 1px solid #eaf0f4;
          border-radius: 22px;
          padding: 18px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          transition: transform 220ms ease, box-shadow 220ms ease;
        }

        .live-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(0,0,0,0.08);
        }

        .live-card::after {
          content: '';
          position: absolute;
          inset: auto -30% -60% auto;
          width: 130px;
          height: 130px;
          background: radial-gradient(circle, rgba(22,163,74,0.08), transparent 62%);
          border-radius: 999px;
          pointer-events: none;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #22c55e;
          box-shadow: 0 0 0 0 rgba(34,197,94,0.5);
          animation: pulseDot 1.8s infinite;
        }

        .unique-frame {
          position: relative;
          overflow: hidden;
        }

        .unique-frame::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.16) 40%, transparent 80%);
          transform: translateX(-130%);
          animation: shineMove 5s linear infinite;
          pointer-events: none;
        }

        .provider-card {
          transition: transform 220ms ease, box-shadow 220ms ease;
        }

        .provider-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 18px 40px rgba(0,0,0,0.09);
        }

        .provider-image {
          transition: transform 300ms ease;
        }

        .provider-card:hover .provider-image {
          transform: scale(1.04);
        }

        .metric-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.14);
          color: #ffffff;
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: 999px;
          padding: 9px 12px;
          font-size: 12px;
          font-weight: 800;
        }

        .metric-rotator {
          min-height: 22px;
          display: inline-flex;
          align-items: center;
          transition: opacity 220ms ease, transform 220ms ease;
        }

        .mini-glass {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 18px;
          backdrop-filter: blur(10px);
        }

        .social-real-logo {
          width: 18px;
          height: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        @keyframes floatChip {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }

        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-10px) translateX(4px); }
        }

        @keyframes marqueeMove {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes pulseDot {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          70% { box-shadow: 0 0 0 10px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }

        @keyframes shineMove {
          0% { transform: translateX(-130%); }
          100% { transform: translateX(130%); }
        }

        @media (max-width: 768px) {
          .marquee-track {
            animation-duration: 18s;
          }
        }
      `}</style>

      <div className={styles.container}>
        <header className={styles.topbar}>
          <Link href="/" className={styles.brand}>
            <div className={styles.brandLogoWrap}>
              <Image
                src="/logo.png"
                alt="Logo Pidelo del Campo"
                width={34}
                height={34}
                priority
              />
            </div>

            <div>
              <div className={styles.brandName}>Pidelo del Campo</div>
              <div className={styles.brandCopy}>
                Productos, animales e insumos en un solo lugar.
              </div>
            </div>
          </Link>

          <div className={styles.navActions}>
            <Link href="/" className={`${styles.navBtn} ${styles.btnHome}`}>
              Inicio
            </Link>

            <Link href="/catalogo" className={`${styles.navBtn} ${styles.btnCatalog}`}>
              Ver catálogo
            </Link>

            {!user ? (
              <Link href="/ingresar" className={`${styles.navBtn} ${styles.btnLogin}`}>
                Ingresar
              </Link>
            ) : (
              <Link href="/perfil" className={`${styles.navBtn} ${styles.btnProfile}`}>
                Perfil
              </Link>
            )}

            <button
              type="button"
              onClick={handlePublish}
              disabled={loadingPublish}
              className={`${styles.navBtn} ${styles.btnPublish}`}
            >
              {loadingPublish ? 'Abriendo...' : '🌱 Publicar mi producto'}
            </button>
          </div>
        </header>

        <section
          className={`${styles.hero} hero-innovation`}
          onMouseMove={handleHeroMouseMove}
        >
          <div className="floating-orb one" />
          <div className="floating-orb two" />
          <div className="floating-orb three" />

          <div className="hero-content-layer">
            <div className={styles.heroLabel}>Inicio</div>

            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <span className="metric-badge">
                <span className="live-dot" />
                Experiencia en movimiento
              </span>

              <span className="metric-badge">
                <span className="metric-rotator">{frasesHero[fraseIndex]}</span>
              </span>
            </div>

            <h1 className={styles.heroTitle}>Compra y publica productos del campo</h1>

            <p className={styles.heroText}>
              Explora el catálogo, encuentra productores y publica tu producto en pocos pasos.
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
                marginTop: 18,
                marginBottom: 18,
              }}
            >
              {[
                '🔒 Más seguridad al publicar',
                '✅ Plataforma clara y sencilla',
                '📱 Pensada para celular',
                '👑 Opción VIP disponible',
              ].map((item) => (
                <span
                  key={item}
                  className="floating-chip"
                  style={{
                    background: 'rgba(255,255,255,0.14)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.18)',
                    padding: '8px 12px',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {item}
                </span>
              ))}
            </div>

            <div className={styles.heroActions}>
              <Link href="/catalogo" className={`${styles.heroBtn} ${styles.heroBtnLight}`}>
                Ver catálogo
              </Link>

              {!user ? (
                <Link href="/ingresar" className={`${styles.heroBtn} ${styles.heroBtnGhost}`}>
                  Ingresar
                </Link>
              ) : (
                <Link href="/perfil" className={`${styles.heroBtn} ${styles.heroBtnGhost}`}>
                  Ir a mi perfil
                </Link>
              )}

              <button
                type="button"
                onClick={handlePublish}
                disabled={loadingPublish}
                className={`${styles.heroBtn} ${styles.heroBtnPrimary}`}
              >
                {loadingPublish ? 'Abriendo...' : '🌱 Publicar mi producto'}
              </button>
            </div>

            <div className="marquee-shell">
              <div className="marquee-track">
                {[...movimientos, ...movimientos].map((item, index) => (
                  <div key={`${item}-${index}`} className="marquee-item">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className="section-live-grid"
          style={{
            marginTop: 22,
          }}
        >
          {datosEnVivo.map((item) => (
            <div key={item.titulo} className="live-card">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <span className="live-dot" />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Ahora
                </span>
              </div>

              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: item.color,
                  marginBottom: 6,
                }}
              >
                {item.valor}
              </div>

              <div
                style={{
                  fontSize: 14,
                  color: '#374151',
                  fontWeight: 700,
                }}
              >
                {item.titulo}
              </div>
            </div>
          ))}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Categorías</h2>
            <p>Explora rápido por tipo de producto.</p>
          </div>

          <div className={styles.categories}>
            {categorias.map((item) => (
              <Link
                key={item.nombre}
                href={`/catalogo?categoria=${encodeURIComponent(item.nombre)}`}
                className={styles.categoryCard}
              >
                <div className={styles.categoryLeft}>
                  <div className={styles.categoryEmoji}>{item.emoji}</div>
                  <div className={styles.categoryName}>{item.nombre}</div>
                </div>

                <div className={styles.categoryArrow}>→</div>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.quickBoxes}>
          <div className={`${styles.quickBox} unique-frame`}>
            <h3>¿Quieres vender?</h3>
            <p>Publica gratis tu producto y luego, si quieres, lo destacas en VIP.</p>

            <div className={styles.quickBoxActions}>
              <button
                type="button"
                onClick={handlePublish}
                className={`${styles.smallBtn} ${styles.smallBtnGreen}`}
              >
                Publicar producto
              </button>

              <a
                href="https://mpago.li/1bgbi9Y"
                target="_blank"
                rel="noreferrer"
                className={`${styles.smallBtn} ${styles.smallBtnWhite}`}
              >
                Activar VIP
              </a>
            </div>

            <div
              style={{
                marginTop: 12,
                fontSize: 12,
                color: '#6b7280',
                lineHeight: 1.6,
              }}
            >
              Pago rápido para destacar tu publicación y darle mayor visibilidad.
            </div>
          </div>

          <div className={`${styles.quickBox} unique-frame`}>
            <h3>¿Ya tienes cuenta?</h3>
            <p>Entra para administrar tus publicaciones, revisar tu perfil o seguir comprando.</p>

            <div className={styles.quickBoxActions}>
              {!user ? (
                <Link href="/ingresar" className={`${styles.smallBtn} ${styles.smallBtnGreen}`}>
                  Ingresar
                </Link>
              ) : (
                <Link href="/perfil" className={`${styles.smallBtn} ${styles.smallBtnGreen}`}>
                  Ver perfil
                </Link>
              )}

              <Link href="/catalogo" className={`${styles.smallBtn} ${styles.smallBtnWhite}`}>
                Ver catálogo
              </Link>
            </div>

            <div
              style={{
                marginTop: 12,
                fontSize: 12,
                color: '#6b7280',
                lineHeight: 1.6,
              }}
            >
              Mantiene el acceso al perfil y al catálogo sin cambiar tu flujo actual.
            </div>
          </div>
        </section>

        <section
          style={{
            marginBottom: 30,
            background: '#ffffff',
            borderRadius: 28,
            padding: 22,
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            border: '1px solid #ecf0f3',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              marginBottom: 18,
            }}
          >
            <div>
              <h2
                style={{
                  margin: '0 0 8px',
                  fontSize: 28,
                  color: '#14532d',
                }}
              >
                Proveedores destacados
              </h2>

              <p
                style={{
                  margin: 0,
                  color: '#4b5563',
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              >
                Destacamos los mejores proveedores con una presentación más fuerte y visual.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  padding: '8px 12px',
                  borderRadius: 999,
                  background: '#ecfdf5',
                  color: '#166534',
                  fontWeight: 800,
                  fontSize: 12,
                  border: '1px solid #bbf7d0',
                }}
              >
                16 destacados
              </span>

              <span
                style={{
                  padding: '8px 12px',
                  borderRadius: 999,
                  background: '#fff7ed',
                  color: '#9a3412',
                  fontWeight: 800,
                  fontSize: 12,
                  border: '1px solid #fed7aa',
                }}
              >
                Fotos elegantes
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 18,
            }}
          >
            {proveedoresDestacados.map((proveedor) => (
              <article
                key={proveedor.nombre}
                className="provider-card"
                style={{
                  background: '#ffffff',
                  borderRadius: 24,
                  overflow: 'hidden',
                  border: '1px solid #e9eef3',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                }}
              >
                <div
                  className="provider-image"
                  style={{
                    height: 180,
                    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.18)), url(${proveedor.imagen})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 14,
                      bottom: 14,
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      className="mini-glass"
                      style={{
                        color: '#14532d',
                        padding: '7px 10px',
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {proveedor.categoria}
                    </span>

                    <span
                      className="mini-glass"
                      style={{
                        color: '#ffffff',
                        padding: '7px 10px',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {proveedor.ciudad}
                    </span>
                  </div>

                  {proveedor.vip && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 14,
                        right: 14,
                        background: '#fff7ed',
                        color: '#9a3412',
                        border: '1px solid #fed7aa',
                        borderRadius: 999,
                        padding: '6px 10px',
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      VIP
                    </span>
                  )}
                </div>

                <div style={{ padding: 16 }}>
                  <h3
                    style={{
                      margin: '0 0 6px',
                      fontSize: 21,
                      color: '#111827',
                    }}
                  >
                    {proveedor.nombre}
                  </h3>

                  <div
                    style={{
                      fontSize: 14,
                      color: '#6b7280',
                      marginBottom: 8,
                    }}
                  >
                    {proveedor.detalle}
                  </div>

                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 900,
                      color: '#166534',
                      marginBottom: 14,
                    }}
                  >
                    {proveedor.precio}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Link
                      href={`/catalogo?categoria=${encodeURIComponent(proveedor.categoria)}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '10px 14px',
                        borderRadius: 999,
                        background: '#ecfdf5',
                        color: '#166534',
                        fontSize: 13,
                        fontWeight: 800,
                        textDecoration: 'none',
                        border: '1px solid #bbf7d0',
                      }}
                    >
                      Ver categoría
                    </Link>

                    {proveedor.vip ? (
                      <a
                        href="https://wa.me/573001234567?text=Hola%20quiero%20m%C3%A1s%20informaci%C3%B3n"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          padding: '10px 14px',
                          borderRadius: 999,
                          background: '#ffffff',
                          color: '#374151',
                          fontSize: 13,
                          fontWeight: 700,
                          textDecoration: 'none',
                          border: '1px solid #e5e7eb',
                        }}
                      >
                        WhatsApp
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={handlePublish}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          padding: '10px 14px',
                          borderRadius: 999,
                          background: '#ffffff',
                          color: '#374151',
                          fontSize: 13,
                          fontWeight: 700,
                          border: '1px solid #e5e7eb',
                          cursor: 'pointer',
                        }}
                      >
                        Publicar similar
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 18,
            marginBottom: 30,
          }}
        >
          <div
            className="unique-frame"
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: 20,
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              border: '1px solid #ecf0f3',
            }}
          >
            <h3
              style={{
                margin: '0 0 10px',
                fontSize: 24,
                color: '#111827',
              }}
            >
              Calculadora rápida
            </h3>

            <p
              style={{
                margin: '0 0 16px',
                color: '#4b5563',
                fontSize: 14,
                lineHeight: 1.7,
              }}
            >
              Un plus útil para estimar costos básicos antes de comprar o vender.
            </p>

            <div
              style={{
                display: 'grid',
                gap: 12,
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#374151',
                    marginBottom: 6,
                  }}
                >
                  Cantidad
                </label>
                <input
                  type="number"
                  value={calcCantidad}
                  onChange={(e) => setCalcCantidad(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '13px 14px',
                    borderRadius: 14,
                    border: '1px solid #d1d5db',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#374151',
                    marginBottom: 6,
                  }}
                >
                  Precio unitario
                </label>
                <input
                  type="number"
                  value={calcPrecio}
                  onChange={(e) => setCalcPrecio(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '13px 14px',
                    borderRadius: 14,
                    border: '1px solid #d1d5db',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#374151',
                    marginBottom: 6,
                  }}
                >
                  Flete estimado
                </label>
                <input
                  type="number"
                  value={calcFlete}
                  onChange={(e) => setCalcFlete(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '13px 14px',
                    borderRadius: 14,
                    border: '1px solid #d1d5db',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                display: 'grid',
                gap: 10,
              }}
            >
              <div
                style={{
                  background: '#f9fafb',
                  border: '1px solid #eceff3',
                  borderRadius: 16,
                  padding: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  fontSize: 14,
                }}
              >
                <span style={{ color: '#4b5563' }}>Subtotal</span>
                <strong style={{ color: '#111827' }}>{money(subtotal)}</strong>
              </div>

              <div
                style={{
                  background: '#f9fafb',
                  border: '1px solid #eceff3',
                  borderRadius: 16,
                  padding: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  fontSize: 14,
                }}
              >
                <span style={{ color: '#4b5563' }}>Flete</span>
                <strong style={{ color: '#111827' }}>{money(Number(calcFlete) || 0)}</strong>
              </div>

              <div
                style={{
                  background: '#ecfdf5',
                  border: '1px solid #bbf7d0',
                  borderRadius: 16,
                  padding: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  fontSize: 15,
                }}
              >
                <span style={{ color: '#166534', fontWeight: 800 }}>Total estimado</span>
                <strong style={{ color: '#166534' }}>{money(total)}</strong>
              </div>

              <div
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 16,
                  padding: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  fontSize: 15,
                }}
              >
                <span style={{ color: '#1d4ed8', fontWeight: 800 }}>Precio sugerido</span>
                <strong style={{ color: '#1d4ed8' }}>{money(sugerido)}</strong>
              </div>
            </div>
          </div>

          <div
            id="comunidad"
            className="unique-frame"
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: 20,
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              border: '1px solid #ecf0f3',
            }}
          >
            <h3
              style={{
                margin: '0 0 10px',
                fontSize: 24,
                color: '#111827',
              }}
            >
              Comentarios y reseñas
            </h3>

            <p
              style={{
                margin: '0 0 16px',
                color: '#4b5563',
                fontSize: 14,
                lineHeight: 1.7,
              }}
            >
              Un espacio dentro de la página para que la comunidad vea movimiento real.
            </p>

            <form onSubmit={handleEnviarComentario}>
              <div
                style={{
                  display: 'grid',
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={chatNombre}
                  onChange={(e) => setChatNombre(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '13px 14px',
                    borderRadius: 14,
                    border: '1px solid #d1d5db',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />

                <input
                  type="text"
                  placeholder="Tu ciudad"
                  value={chatCiudad}
                  onChange={(e) => setChatCiudad(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '13px 14px',
                    borderRadius: 14,
                    border: '1px solid #d1d5db',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />

                <textarea
                  placeholder="Escribe tu comentario"
                  value={chatMensaje}
                  onChange={(e) => setChatMensaje(e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '13px 14px',
                    borderRadius: 14,
                    border: '1px solid #d1d5db',
                    fontSize: 14,
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <button
                type="submit"
                className={`${styles.smallBtn} ${styles.smallBtnGreen}`}
                style={{ width: '100%' }}
              >
                Publicar comentario
              </button>
            </form>

            <div
              style={{
                marginTop: 16,
                display: 'grid',
                gap: 12,
              }}
            >
              {comentarios.map((item, index) => (
                <div
                  key={`${item.nombre}-${index}`}
                  style={{
                    background: '#f9fafb',
                    border: '1px solid #eceff3',
                    borderRadius: 18,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 10,
                      flexWrap: 'wrap',
                      marginBottom: 6,
                    }}
                  >
                    <strong
                      style={{
                        fontSize: 14,
                        color: '#111827',
                      }}
                    >
                      {item.nombre} · {item.ciudad}
                    </strong>

                    <span
                      style={{
                        fontSize: 12,
                        color: '#6b7280',
                      }}
                    >
                      {item.tiempo}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      color: '#4b5563',
                      lineHeight: 1.65,
                    }}
                  >
                    {item.mensaje}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 18,
                display: 'grid',
                gap: 12,
              }}
            >
              {resenasIniciales.map((item) => (
                <div
                  key={item.nombre}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #eceff3',
                    borderRadius: 18,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 10,
                      flexWrap: 'wrap',
                      marginBottom: 6,
                    }}
                  >
                    <strong
                      style={{
                        fontSize: 14,
                        color: '#111827',
                      }}
                    >
                      {item.nombre} · {item.lugar}
                    </strong>

                    <span
                      style={{
                        fontSize: 13,
                        color: '#eab308',
                        letterSpacing: 1,
                      }}
                    >
                      ★★★★★
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      color: '#4b5563',
                      lineHeight: 1.65,
                    }}
                  >
                    {item.texto}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          style={{
            marginTop: 24,
            marginBottom: 24,
            background: '#ffffff',
            borderRadius: 24,
            padding: 22,
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            border: '1px solid #ecf0f3',
          }}
        >
          <div
            style={{
              display: 'grid',
              gap: 18,
            }}
          >
            <div>
              <h2
                style={{
                  margin: '0 0 8px',
                  fontSize: 24,
                  color: '#14532d',
                  fontWeight: 900,
                }}
              >
                Redes sociales y confianza
              </h2>

              <p
                style={{
                  margin: 0,
                  color: '#4b5563',
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              >
                Síguenos en redes, revisa métodos de pago y encuentra accesos rápidos al final de la página.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 18,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: '#166534',
                    marginBottom: 10,
                  }}
                >
                  Redes sociales
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  {redesSociales.map((item) => (
                    <a
                      key={item.nombre}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 11px',
                        borderRadius: 999,
                        background: '#f8fafc',
                        border: '1px solid #e5e7eb',
                        color: '#1f2937',
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      <span className="social-real-logo">{item.icono}</span>
                      {item.nombre}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: '#166534',
                    marginBottom: 10,
                  }}
                >
                  Métodos de pago confiables
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  {['PSE', 'Nequi', 'Visa', 'Mastercard', 'Mercado Pago', 'Bancolombia', 'Davivienda'].map((item) => (
                    <span
                      key={item}
                      style={{
                        background: '#ecfdf5',
                        color: '#166534',
                        padding: '7px 10px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 800,
                        border: '1px solid #bbf7d0',
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: '#166534',
                    marginBottom: 10,
                  }}
                >
                  Accesos rápidos
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  <Link
                    href="/catalogo"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 10px',
                      borderRadius: 999,
                      background: '#f3f4f6',
                      color: '#111827',
                      fontSize: 12,
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    📚 Catálogo
                  </Link>

                  {!user ? (
                    <Link
                      href="/ingresar"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 10px',
                        borderRadius: 999,
                        background: '#f3f4f6',
                        color: '#111827',
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      👤 Ingresar
                    </Link>
                  ) : (
                    <Link
                      href="/perfil"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 10px',
                        borderRadius: 999,
                        background: '#f3f4f6',
                        color: '#111827',
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      👤 Perfil
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handlePublish}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 10px',
                      borderRadius: 999,
                      background: '#166534',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    🌱 Publicar
                  </button>

                  <a
                    href="https://mpago.li/1bgbi9Y"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 10px',
                      borderRadius: 999,
                      background: '#fff7ed',
                      color: '#9a3412',
                      fontSize: 12,
                      fontWeight: 700,
                      textDecoration: 'none',
                      border: '1px solid #fed7aa',
                    }}
                  >
                    👑 VIP
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer
          style={{
            marginTop: 24,
            marginBottom: 20,
            background: '#ffffff',
            borderRadius: 24,
            padding: 22,
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            border: '1px solid #ecf0f3',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 18,
              alignItems: 'start',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: '#14532d',
                  marginBottom: 8,
                }}
              >
                Pidelo del Campo
              </div>

              <p
                style={{
                  margin: 0,
                  color: '#4b5563',
                  lineHeight: 1.7,
                  fontSize: 14,
                }}
              >
                Productos, animales e insumos en un solo lugar, con una experiencia más clara y confiable.
              </p>
            </div>

            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: '#14532d',
                  marginBottom: 8,
                }}
              >
                Enlaces rápidos
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  fontSize: 14,
                }}
              >
                <Link href="/catalogo" style={{ color: '#374151', textDecoration: 'none' }}>
                  Ver catálogo
                </Link>

                {!user ? (
                  <Link href="/ingresar" style={{ color: '#374151', textDecoration: 'none' }}>
                    Ingresar
                  </Link>
                ) : (
                  <Link href="/perfil" style={{ color: '#374151', textDecoration: 'none' }}>
                    Perfil
                  </Link>
                )}

                <a href="#comunidad" style={{ color: '#374151', textDecoration: 'none' }}>
                  Comunidad
                </a>
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: '#14532d',
                  marginBottom: 8,
                }}
              >
                Estado del sitio
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    background: '#ecfdf5',
                    color: '#166534',
                    padding: '7px 10px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 800,
                    width: 'fit-content',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  Sitio activo
                </span>

                <span
                  style={{
                    background: '#f9fafb',
                    color: '#374151',
                    padding: '7px 10px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    width: 'fit-content',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  Diseñado para móvil
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: '1px solid #e5e7eb',
              color: '#6b7280',
              fontSize: 12,
              textAlign: 'center',
            }}
          >
            © 2026 Pidelo del Campo. Todos los derechos reservados.
          </div>
        </footer>
      </div>
    </main>
  )
}