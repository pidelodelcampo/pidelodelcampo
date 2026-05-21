'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'

const departamentosBase = [
  'Todos los departamentos',
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
  'Todas las categorías',
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
  'Todos los tipos',
  'Por kilo',
  'Por litro',
  'Por unidad',
  'Por manojo',
  'Por caja',
  'Por bulto',
  'Al por mayor',
]

const ordenes = [
  'Premium primero',
  'Más populares',
  'Precio: menor a mayor',
  'Precio: mayor a menor',
  'Más recientes',
]

type ProductoUI = {
  id: string
  nombre: string
  categoria: string
  departamento: string
  municipio: string
  tipo: string
  precioNumero: number
  vendedor: string
  foto: string
  likes: number
  premium: boolean
  nuevo: boolean
  telefono: string
  whatsapp: string
  color: string
}

type MunicipioItem = {
  departamento: string
  municipio: string
  departamento_slug: string
  municipio_slug: string
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

function slugify(value: string) {
  return normalizeText(value).replace(/\s+/g, '-')
}

function formatCOP(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function isNuevo(fecha?: string | null) {
  if (!fecha) return false
  const now = new Date().getTime()
  const date = new Date(fecha).getTime()
  const diff = now - date
  const dosDias = 2 * 24 * 60 * 60 * 1000
  return diff <= dosDias
}

function getPlaceholderByCategory(categoria: string) {
  const map: Record<string, string> = {
    Frutas: '/logo.png',
    Verduras: '/logo.png',
    Hortalizas: '/logo.png',
    Tubérculos: '/logo.png',
    'Hierbas y aromáticas': '/logo.png',
    'Granos y cereales': '/logo.png',
    Lácteos: '/logo.png',
    Huevos: '/logo.png',
    Aves: '/logo.png',
    Porcinos: '/logo.png',
    Bovinos: '/logo.png',
    Caprinos: '/logo.png',
    Ovinos: '/logo.png',
    'Pescados y mariscos': '/logo.png',
    'Abonos e insumos': '/logo.png',
  }

  return map[categoria] || '/logo.png'
}

function dedupeMunicipios(items: MunicipioItem[]) {
  const mapa = new Map<string, MunicipioItem>()

  for (const item of items) {
    const depto = (item.departamento || '').trim()
    const muni = (item.municipio || '').trim()

    if (!depto || !muni) continue

    const departamento_slug = item.departamento_slug || slugify(depto)
    const municipio_slug = item.municipio_slug || slugify(muni)
    const key = `${departamento_slug}::${municipio_slug}`

    if (!mapa.has(key)) {
      mapa.set(key, {
        departamento: depto,
        municipio: muni,
        departamento_slug,
        municipio_slug,
      })
    }
  }

  return Array.from(mapa.values())
}

const mensajesHero = [
  'Filtra por ciudad, categoría y tipo de venta.',
  'Encuentra productores y publicaciones visibles en segundos.',
  'Los productos VIP resaltan primero y convierten mejor.',
  'Una vitrina más fuerte para compradores y vendedores.',
]

const cintaActividad = [
  '⚡ Catálogo con filtros inteligentes',
  '📍 Municipios dinámicos desde tu base de datos',
  '👑 Publicaciones VIP más visibles',
  '🆕 Productos nuevos destacados',
  '💚 Guardar favoritos con un toque',
  '📱 Diseño pensado para celular',
]

export default function CatalogoPage() {
  const [loadingProductos, setLoadingProductos] = useState(true)
  const [loadingMunicipios, setLoadingMunicipios] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('Todas las categorías')
  const [departamento, setDepartamento] = useState('Todos los departamentos')
  const [municipio, setMunicipio] = useState('Todos los municipios')
  const [tipoVenta, setTipoVenta] = useState('Todos los tipos')
  const [orden, setOrden] = useState('Premium primero')

  const [favoritos, setFavoritos] = useState<string[]>([])
  const [productosBase, setProductosBase] = useState<ProductoUI[]>([])
  const [municipiosFuente, setMunicipiosFuente] = useState<MunicipioItem[]>([])

  const [heroIndex, setHeroIndex] = useState(0)
  const [glow, setGlow] = useState({ x: 50, y: 50 })

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % mensajesHero.length)
    }, 2600)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let activo = true

    const cargarProductos = async () => {
      setLoadingProductos(true)
      setErrorCarga('')

      try {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('estado', 'published')
          .order('created_at', { ascending: false })
          .range(0, 2000)

        if (productsError) throw productsError

        const products = productsData || []
        const ids = products.map((p) => p.id)

        let imageMap: Record<string, string> = {}

        if (ids.length > 0) {
          const { data: imagesData, error: imagesError } = await supabase
            .from('product_images')
            .select('product_id, image_url, sort_order')
            .in('product_id', ids)
            .order('sort_order', { ascending: true })
            .range(0, 4000)

          if (imagesError) throw imagesError

          ;(imagesData || []).forEach((img) => {
            if (!imageMap[img.product_id]) {
              imageMap[img.product_id] = img.image_url
            }
          })
        }

        const productosTransformados: ProductoUI[] = products.map((item) => ({
          id: item.id,
          nombre: item.nombre_producto || 'Producto sin nombre',
          categoria: item.categoria || 'Sin categoría',
          departamento: item.departamento || 'Sin departamento',
          municipio: item.municipio || 'Sin municipio',
          tipo: item.tipo_venta || 'Sin tipo',
          precioNumero: Number(item.precio || 0),
          vendedor: item.nombre_vendedor || 'Vendedor',
          foto: imageMap[item.id] || getPlaceholderByCategory(item.categoria || ''),
          likes: item.likes_count ?? 0,
          premium: !!item.vip_activo || item.plan === 'vip',
          nuevo: isNuevo(item.published_at || item.created_at),
          telefono: item.telefono || '',
          whatsapp: item.whatsapp || item.telefono || '',
          color: item.vip_activo ? '#fff7ed' : '#f8fafc',
        }))

        if (activo) {
          setProductosBase(productosTransformados)
        }
      } catch (err: any) {
        console.error(err)
        if (activo) {
          setErrorCarga(err.message || 'No se pudo cargar el catálogo.')
        }
      } finally {
        if (activo) {
          setLoadingProductos(false)
        }
      }
    }

    cargarProductos()

    return () => {
      activo = false
    }
  }, [])

  useEffect(() => {
    let activo = true

    const cargarMunicipios = async () => {
      setLoadingMunicipios(true)

      try {
        const [oficialesResp, guardadosResp] = await Promise.all([
          supabase
            .from('municipios_colombia')
            .select('departamento, municipio, departamento_slug, municipio_slug')
            .order('departamento', { ascending: true })
            .order('municipio', { ascending: true })
            .range(0, 2000),
          supabase
            .from('municipios_filtro')
            .select('departamento, municipio, departamento_slug, municipio_slug')
            .order('departamento', { ascending: true })
            .order('municipio', { ascending: true })
            .range(0, 2000),
        ])

        const oficiales =
          oficialesResp.error || !oficialesResp.data
            ? []
            : (oficialesResp.data as MunicipioItem[])

        const guardados =
          guardadosResp.error || !guardadosResp.data
            ? []
            : (guardadosResp.data as MunicipioItem[])

        const desdeProductos: MunicipioItem[] = productosBase.map((item) => ({
          departamento: item.departamento,
          municipio: item.municipio,
          departamento_slug: slugify(item.departamento),
          municipio_slug: slugify(item.municipio),
        }))

        const municipiosUnificados = dedupeMunicipios([
          ...oficiales,
          ...guardados,
          ...desdeProductos,
        ])

        if (activo) {
          setMunicipiosFuente(municipiosUnificados)
        }
      } catch (err) {
        console.error(err)

        const desdeProductos: MunicipioItem[] = productosBase.map((item) => ({
          departamento: item.departamento,
          municipio: item.municipio,
          departamento_slug: slugify(item.departamento),
          municipio_slug: slugify(item.municipio),
        }))

        if (activo) {
          setMunicipiosFuente(dedupeMunicipios(desdeProductos))
        }
      } finally {
        if (activo) {
          setLoadingMunicipios(false)
        }
      }
    }

    cargarMunicipios()

    return () => {
      activo = false
    }
  }, [productosBase])

  const departamentosDisponibles = useMemo(() => {
    const base = departamentosBase.slice(1)

    const desdeData = Array.from(
      new Set([
        ...municipiosFuente.map((item) => item.departamento).filter(Boolean),
        ...productosBase.map((item) => item.departamento).filter(Boolean),
      ])
    )

    const unicos = Array.from(new Set([...base, ...desdeData]))

    const ordenados = unicos.sort((a, b) => {
      if (a === 'Bogotá D.C.') return -1
      if (b === 'Bogotá D.C.') return 1
      return a.localeCompare(b, 'es')
    })

    return ['Todos los departamentos', ...ordenados]
  }, [municipiosFuente, productosBase])

  const municipiosDisponibles = useMemo(() => {
    const base =
      departamento === 'Todos los departamentos'
        ? municipiosFuente
        : municipiosFuente.filter(
            (item) =>
              normalizeText(item.departamento) === normalizeText(departamento)
          )

    const ordenados = [...base].sort((a, b) =>
      a.municipio.localeCompare(b.municipio, 'es')
    )

    return [
      { value: 'Todos los municipios', label: 'Todos los municipios' },
      ...ordenados.map((item) => ({
        value: item.municipio,
        label: item.municipio,
      })),
    ]
  }, [departamento, municipiosFuente])

  const productos = useMemo(() => {
    let lista = productosBase.filter((producto) => {
      const texto = normalizeText(busqueda)

      const coincideBusqueda =
        texto === '' ||
        normalizeText(producto.nombre).includes(texto) ||
        normalizeText(producto.categoria).includes(texto) ||
        normalizeText(producto.departamento).includes(texto) ||
        normalizeText(producto.municipio).includes(texto) ||
        normalizeText(producto.vendedor).includes(texto)

      const coincideCategoria =
        categoria === 'Todas las categorías' || producto.categoria === categoria

      const coincideDepartamento =
        departamento === 'Todos los departamentos' ||
        normalizeText(producto.departamento) === normalizeText(departamento)

      const coincideMunicipio =
        municipio === 'Todos los municipios' ||
        normalizeText(producto.municipio) === normalizeText(municipio)

      const coincideTipo =
        tipoVenta === 'Todos los tipos' || producto.tipo === tipoVenta

      return (
        coincideBusqueda &&
        coincideCategoria &&
        coincideDepartamento &&
        coincideMunicipio &&
        coincideTipo
      )
    })

    if (orden === 'Precio: menor a mayor') {
      lista = [...lista].sort((a, b) => a.precioNumero - b.precioNumero)
    }

    if (orden === 'Precio: mayor a menor') {
      lista = [...lista].sort((a, b) => b.precioNumero - a.precioNumero)
    }

    if (orden === 'Premium primero') {
      lista = [...lista].sort((a, b) => {
        if (Number(b.premium) !== Number(a.premium)) {
          return Number(b.premium) - Number(a.premium)
        }
        return b.likes - a.likes
      })
    }

    if (orden === 'Más recientes') {
      lista = [...lista].sort((a, b) => {
        if (Number(b.nuevo) !== Number(a.nuevo)) {
          return Number(b.nuevo) - Number(a.nuevo)
        }
        return b.likes - a.likes
      })
    }

    if (orden === 'Más populares') {
      lista = [...lista].sort((a, b) => {
        const likesA = a.likes + (favoritos.includes(a.id) ? 1 : 0)
        const likesB = b.likes + (favoritos.includes(b.id) ? 1 : 0)
        return likesB - likesA
      })
    }

    return lista
  }, [busqueda, categoria, departamento, municipio, tipoVenta, orden, favoritos, productosBase])

  const totalPremium = useMemo(
    () => productosBase.filter((item) => item.premium).length,
    [productosBase]
  )

  const totalNuevos = useMemo(
    () => productosBase.filter((item) => item.nuevo).length,
    [productosBase]
  )

  const municipiosVisibles = useMemo(
    () => new Set(productos.map((item) => item.municipio)).size,
    [productos]
  )

  const precioPromedio = useMemo(() => {
    if (!productos.length) return 0
    const suma = productos.reduce((acc, item) => acc + item.precioNumero, 0)
    return suma / productos.length
  }, [productos])

  const filtrosActivos = useMemo(() => {
    const activos: string[] = []

    if (busqueda.trim()) activos.push(`Búsqueda: ${busqueda.trim()}`)
    if (categoria !== 'Todas las categorías') activos.push(categoria)
    if (departamento !== 'Todos los departamentos') activos.push(departamento)
    if (municipio !== 'Todos los municipios') activos.push(municipio)
    if (tipoVenta !== 'Todos los tipos') activos.push(tipoVenta)
    if (orden !== 'Premium primero') activos.push(`Orden: ${orden}`)

    return activos
  }, [busqueda, categoria, departamento, municipio, tipoVenta, orden])

  const toggleFavorito = (id: string) => {
    setFavoritos((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setCategoria('Todas las categorías')
    setDepartamento('Todos los departamentos')
    setMunicipio('Todos los municipios')
    setTipoVenta('Todos los tipos')
    setOrden('Premium primero')
  }

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setGlow({ x, y })
  }

  return (
    <main className={styles.page}>
      <style jsx global>{`
        .catalog-hero-unique {
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }

        .catalog-hero-unique::before {
          content: '';
          position: absolute;
          inset: -10%;
          background:
            radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(255,255,255,0.22), transparent 20%),
            radial-gradient(circle at 18% 20%, rgba(255,255,255,0.12), transparent 18%),
            radial-gradient(circle at 85% 24%, rgba(255,255,255,0.12), transparent 18%);
          pointer-events: none;
          z-index: 0;
          transition: background 180ms ease;
        }

        .catalog-hero-content {
          position: relative;
          z-index: 1;
        }

        .hero-orb {
          position: absolute;
          border-radius: 999px;
          filter: blur(16px);
          opacity: 0.16;
          pointer-events: none;
          animation: heroOrbFloat 8s ease-in-out infinite;
        }

        .hero-orb.one {
          width: 120px;
          height: 120px;
          top: 10%;
          right: 6%;
          background: #ffffff;
        }

        .hero-orb.two {
          width: 90px;
          height: 90px;
          bottom: 14%;
          left: 6%;
          background: #bef264;
          animation-delay: 1.2s;
        }

        .hero-orb.three {
          width: 100px;
          height: 100px;
          top: 55%;
          right: 28%;
          background: #86efac;
          animation-delay: 2.1s;
        }

        .catalog-live-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 14px;
          margin-top: 18px;
        }

        .catalog-live-card {
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 18px;
          padding: 14px;
          backdrop-filter: blur(8px);
        }

        .catalog-live-label {
          font-size: 12px;
          color: rgba(255,255,255,0.82);
          font-weight: 700;
          margin-bottom: 5px;
        }

        .catalog-live-value {
          font-size: 24px;
          color: #ffffff;
          font-weight: 900;
        }

        .catalog-rotator {
          display: inline-flex;
          align-items: center;
          min-height: 22px;
        }

        .catalog-marquee-shell {
          margin-top: 18px;
          overflow: hidden;
          border-radius: 18px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.14);
          padding: 10px 0;
        }

        .catalog-marquee-track {
          display: flex;
          width: max-content;
          animation: catalogMarquee 24s linear infinite;
        }

        .catalog-marquee-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 0 10px;
          padding: 8px 12px;
          background: rgba(255,255,255,0.92);
          color: #14532d;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .active-filters-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
        }

        .active-filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 999px;
          background: #f8fafc;
          color: #166534;
          border: 1px solid #dbe7df;
          font-size: 12px;
          font-weight: 800;
        }

        .catalog-highlight-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 14px;
          margin: 22px 0 8px;
        }

        .catalog-highlight-card {
          background: #ffffff;
          border: 1px solid #e7edf1;
          border-radius: 22px;
          padding: 18px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          transition: transform 220ms ease, box-shadow 220ms ease;
        }

        .catalog-highlight-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 40px rgba(0,0,0,0.08);
        }

        .catalog-highlight-value {
          font-size: 28px;
          font-weight: 900;
          color: #14532d;
          margin-bottom: 6px;
        }

        .catalog-highlight-title {
          font-size: 14px;
          color: #374151;
          font-weight: 700;
        }

        .catalog-highlight-copy {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
          line-height: 1.55;
        }

        .catalog-grid-enhanced .${styles.productCard} {
          transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
          position: relative;
          overflow: hidden;
        }

        .catalog-grid-enhanced .${styles.productCard}:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 40px rgba(15,23,42,0.10);
          border-color: #dce7e2;
        }

        .catalog-grid-enhanced .${styles.productCard}::after {
          content: '';
          position: absolute;
          inset: auto -30% -60% auto;
          width: 140px;
          height: 140px;
          background: radial-gradient(circle, rgba(22,163,74,0.09), transparent 65%);
          border-radius: 999px;
          pointer-events: none;
        }

        .premium-glow {
          box-shadow:
            0 18px 38px rgba(249,115,22,0.10),
            0 0 0 1px rgba(251,191,36,0.18) inset;
        }

        .media-shell-unique {
          position: relative;
          overflow: hidden;
        }

        .media-shell-unique .${styles.productImage} {
          transition: transform 320ms ease, filter 320ms ease;
        }

        .catalog-grid-enhanced .${styles.productCard}:hover .${styles.productImage} {
          transform: scale(1.05);
          filter: saturate(1.04);
        }

        .floating-trust-pill {
          position: absolute;
          left: 12px;
          bottom: 12px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 11px;
          border-radius: 999px;
          background: rgba(255,255,255,0.92);
          color: #14532d;
          font-size: 12px;
          font-weight: 800;
          backdrop-filter: blur(10px);
        }

        .tiny-live-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #22c55e;
          box-shadow: 0 0 0 0 rgba(34,197,94,0.55);
          animation: pulseDot 1.8s infinite;
        }

        .quick-empty-shell {
          background: linear-gradient(180deg, #ffffff 0%, #f8fbf9 100%);
          border: 1px solid #e6eeea;
          border-radius: 24px;
          padding: 26px;
          box-shadow: 0 12px 34px rgba(0,0,0,0.05);
        }

        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 18px;
        }

        .skeleton-card {
          background: #ffffff;
          border: 1px solid #e9eef3;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.04);
        }

        .skeleton-media,
        .skeleton-line {
          background: linear-gradient(90deg, #eef2f5 25%, #f8fafc 50%, #eef2f5 75%);
          background-size: 200% 100%;
          animation: shimmer 1.6s infinite linear;
        }

        .skeleton-media {
          height: 190px;
        }

        .skeleton-body {
          padding: 16px;
          display: grid;
          gap: 10px;
        }

        .skeleton-line {
          border-radius: 999px;
          height: 12px;
        }

        .skeleton-line.lg {
          height: 18px;
          width: 70%;
        }

        .skeleton-line.md {
          width: 48%;
        }

        .skeleton-line.sm {
          width: 30%;
        }

        .catalog-top-tools {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 12px;
          margin: 8px 0 18px;
          align-items: center;
        }

        .catalog-results-copy {
          font-size: 14px;
          color: #4b5563;
          line-height: 1.65;
        }

        .catalog-mini-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 999px;
          background: #ecfdf5;
          color: #166534;
          border: 1px solid #bbf7d0;
          text-decoration: none;
          font-size: 13px;
          font-weight: 800;
        }

        @keyframes heroOrbFloat {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-10px) translateX(5px); }
        }

        @keyframes pulseDot {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.55); }
          70% { box-shadow: 0 0 0 10px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @keyframes catalogMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @media (max-width: 768px) {
          .catalog-live-row {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .catalog-highlight-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .catalog-marquee-track {
            animation-duration: 18s;
          }
        }
      `}</style>

      <section className={styles.container}>
        <div className={styles.topbar}>
          <Link href="/" className={styles.brand}>
            <div className={styles.brandLogoWrap}>
              <Image src="/logo.png" alt="Logo Pidelo del Campo" width={32} height={32} />
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

            <Link href="/publicar" className={`${styles.navBtn} ${styles.btnPublish}`}>
              🌱 Publicar mi producto
            </Link>
          </div>
        </div>

        <div
          className={`${styles.hero} catalog-hero-unique`}
          onMouseMove={handleHeroMouseMove}
        >
          <div className="hero-orb one" />
          <div className="hero-orb two" />
          <div className="hero-orb three" />

          <div className="catalog-hero-content">
            <div className={styles.heroLabel}>Catálogo</div>
            <h1 className={styles.heroTitle}>Encuentra productos del campo en un solo lugar</h1>
            <p className={styles.heroText}>
              Busca por producto, vendedor, categoría, departamento, municipio o tipo de venta.
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
                marginTop: 16,
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  background: 'rgba(255,255,255,0.14)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.18)',
                  padding: '8px 12px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                <span className="catalog-rotator">{mensajesHero[heroIndex]}</span>
              </span>

              <span
                style={{
                  background: 'rgba(255,255,255,0.14)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.18)',
                  padding: '8px 12px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                👑 Los VIP resaltan primero
              </span>

              <span
                style={{
                  background: 'rgba(255,255,255,0.14)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.18)',
                  padding: '8px 12px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                📱 Catálogo rápido para celular
              </span>
            </div>

            <div className={styles.heroActions}>
              <Link href="/publicar" className={`${styles.heroBtn} ${styles.heroBtnPrimary}`}>
                Publicar producto
              </Link>

              <a href="#productos" className={`${styles.heroBtn} ${styles.heroBtnSecondary}`}>
                Ver productos
              </a>
            </div>

            <div className="catalog-live-row">
              <div className="catalog-live-card">
                <div className="catalog-live-label">Publicaciones</div>
                <div className="catalog-live-value">
                  {loadingProductos ? '...' : productosBase.length}
                </div>
              </div>

              <div className="catalog-live-card">
                <div className="catalog-live-label">VIP visibles</div>
                <div className="catalog-live-value">
                  {loadingProductos ? '...' : totalPremium}
                </div>
              </div>

              <div className="catalog-live-card">
                <div className="catalog-live-label">Municipios</div>
                <div className="catalog-live-value">
                  {loadingMunicipios ? '...' : municipiosFuente.length}
                </div>
              </div>

              <div className="catalog-live-card">
                <div className="catalog-live-label">Favoritos</div>
                <div className="catalog-live-value">{favoritos.length}</div>
              </div>
            </div>

            <div className="catalog-marquee-shell">
              <div className="catalog-marquee-track">
                {[...cintaActividad, ...cintaActividad].map((item, index) => (
                  <div key={`${item}-${index}`} className="catalog-marquee-item">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.filtersPanel}>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar producto, vendedor, departamento o municipio..."
                className={styles.searchInput}
              />

              <div className={styles.filterGrid}>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className={styles.filterSelect}
                >
                  {categorias.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <select
                  value={departamento}
                  onChange={(e) => {
                    setDepartamento(e.target.value)
                    setMunicipio('Todos los municipios')
                  }}
                  className={styles.filterSelect}
                >
                  {departamentosDisponibles.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <select
                  value={municipio}
                  onChange={(e) => setMunicipio(e.target.value)}
                  className={styles.filterSelect}
                >
                  {municipiosDisponibles.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>

                <select
                  value={tipoVenta}
                  onChange={(e) => setTipoVenta(e.target.value)}
                  className={styles.filterSelect}
                >
                  {tiposVenta.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <select
                  value={orden}
                  onChange={(e) => setOrden(e.target.value)}
                  className={styles.filterSelect}
                >
                  {ordenes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.toolbarActions}>
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className={`${styles.toolbarBtn} ${styles.btnClear}`}
                >
                  Limpiar filtros
                </button>

                <a
                  href="https://mpago.li/1bgbi9Y"
                  target="_blank"
                  rel="noreferrer"
                  className={`${styles.toolbarBtn} ${styles.btnCtaSmall}`}
                >
                  Destacar en VIP
                </a>
              </div>

              <div className="active-filters-wrap">
                {filtrosActivos.length > 0 ? (
                  filtrosActivos.map((item) => (
                    <span key={item} className="active-filter-chip">
                      ✨ {item}
                    </span>
                  ))
                ) : (
                  <span className="active-filter-chip">Vista general del catálogo</span>
                )}
              </div>

              <p className={styles.heroText} style={{ marginTop: 14 }}>
                {loadingProductos
                  ? 'Cargando catálogo...'
                  : `${productos.length} resultado(s) • ${
                      loadingMunicipios
                        ? 'cargando municipios...'
                        : `${municipiosFuente.length} municipio(s) disponibles en filtros`
                    }`}
              </p>
            </div>
          </div>
        </div>

        {!loadingProductos && !errorCarga && (
          <section className="catalog-highlight-grid">
            <div className="catalog-highlight-card">
              <div className="catalog-highlight-value">{productos.length}</div>
              <div className="catalog-highlight-title">Resultados visibles</div>
              <div className="catalog-highlight-copy">
                Lo que el usuario está viendo justo ahora con los filtros aplicados.
              </div>
            </div>

            <div className="catalog-highlight-card">
              <div className="catalog-highlight-value">{municipiosVisibles}</div>
              <div className="catalog-highlight-title">Municipios visibles</div>
              <div className="catalog-highlight-copy">
                Más variedad geográfica dentro de la búsqueda activa.
              </div>
            </div>

            <div className="catalog-highlight-card">
              <div className="catalog-highlight-value">{totalNuevos}</div>
              <div className="catalog-highlight-title">Productos nuevos</div>
              <div className="catalog-highlight-copy">
                Publicaciones recientes que generan más sensación de movimiento.
              </div>
            </div>

            <div className="catalog-highlight-card">
              <div className="catalog-highlight-value">
                {precioPromedio ? formatCOP(precioPromedio) : '$ 0'}
              </div>
              <div className="catalog-highlight-title">Precio promedio</div>
              <div className="catalog-highlight-copy">
                Referencia rápida para recorrer el catálogo con más contexto.
              </div>
            </div>
          </section>
        )}

        <section id="productos">
          <div className="catalog-top-tools">
            <div className="catalog-results-copy">
              Explora las publicaciones, guarda favoritos y prioriza VIP o recientes según tu objetivo.
            </div>

            <Link href="/publicar" className="catalog-mini-cta">
              🌱 Publicar y aparecer aquí
            </Link>
          </div>

          {loadingProductos && (
            <div className="quick-empty-shell">
              <div className="skeleton-grid">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="skeleton-card">
                    <div className="skeleton-media" />
                    <div className="skeleton-body">
                      <div className="skeleton-line lg" />
                      <div className="skeleton-line md" />
                      <div className="skeleton-line sm" />
                      <div className="skeleton-line" />
                      <div className="skeleton-line md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loadingProductos && errorCarga && (
            <div className={`${styles.empty} quick-empty-shell`}>
              <div className={styles.emptyIcon}>⚠️</div>
              <h3>No se pudo cargar el catálogo</h3>
              <p>{errorCarga}</p>
            </div>
          )}

          {!loadingProductos && !errorCarga && (
            <>
              <div className={`${styles.grid} catalog-grid-enhanced`}>
                {productos.map((producto) => {
                  const esFavorito = favoritos.includes(producto.id)
                  const totalLikes = producto.likes + (esFavorito ? 1 : 0)

                  const telefonoLimpio = (producto.telefono || '').replace(/\D/g, '')
                  const whatsappLimpio = (producto.whatsapp || '').replace(/\D/g, '')

                  const mensaje = encodeURIComponent(
                    `Hola, me interesa ${producto.nombre} publicado en Pidelo del Campo.`
                  )

                  return (
                    <article
                      key={producto.id}
                      className={`${styles.productCard} ${
                        producto.premium ? styles.premiumCard : ''
                      } ${producto.premium ? 'premium-glow' : ''}`}
                    >
                      <div className={`${styles.media} media-shell-unique`} style={{ background: producto.color }}>
                        <img
                          src={producto.foto}
                          alt={producto.nombre}
                          className={styles.productImage}
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget
                            if (!target.src.endsWith('/logo.png')) {
                              target.src = getPlaceholderByCategory(producto.categoria)
                            }
                          }}
                        />

                        <div className={styles.badges}>
                          <span className={`${styles.badge} ${styles.badgeCategory}`}>
                            {producto.categoria}
                          </span>

                          {producto.premium && (
                            <span className={`${styles.badge} ${styles.badgePremium}`}>
                              PREMIUM VIP
                            </span>
                          )}

                          {producto.nuevo && !producto.premium && (
                            <span className={`${styles.badge} ${styles.badgeNew}`}>
                              Nuevo
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => toggleFavorito(producto.id)}
                          aria-label="Dar me gusta"
                          className={`${styles.favBtn} ${esFavorito ? styles.active : ''}`}
                          type="button"
                        >
                          {esFavorito ? '♥' : '♡'}
                        </button>

                        <div className={styles.likesPill}>{totalLikes} me gusta</div>

                        <div className="floating-trust-pill">
                          <span className="tiny-live-dot" />
                          {producto.premium ? 'Contacto prioritario' : 'Publicación visible'}
                        </div>
                      </div>

                      <div className={styles.cardBody}>
                        <div className={styles.cardTop}>
                          <div>
                            <h3>{producto.nombre}</h3>
                            <p className={styles.seller}>{producto.vendedor}</p>
                          </div>

                          <div className={styles.cityBadge}>{producto.municipio}</div>
                        </div>

                        <div className={styles.meta}>
                          <span className={styles.metaDepto}>{producto.departamento}</span>
                          <span className={styles.metaTipo}>{producto.tipo}</span>
                        </div>

                        <div className={styles.priceRow}>
                          <div>
                            <div
                              className={`${styles.price} ${
                                producto.premium ? styles.premiumPrice : ''
                              }`}
                            >
                              {formatCOP(producto.precioNumero)}
                            </div>
                            <div className={styles.contactCopy}>
                              Contacto con {producto.vendedor}
                            </div>
                          </div>

                          <div
                            className={`${styles.trustBadge} ${
                              producto.premium ? styles.trustPremium : styles.trustNormal
                            }`}
                          >
                            {producto.premium ? 'VIP' : 'Verificado'}
                          </div>
                        </div>

                        <div className={styles.actions}>
                          {producto.premium ? (
                            <>
                              <a
                                href={telefonoLimpio ? `tel:${telefonoLimpio}` : '#'}
                                className={`${styles.actionBtn} ${styles.btnCall}`}
                              >
                                Llamar
                              </a>

                              <a
                                href={
                                  whatsappLimpio
                                    ? `https://wa.me/${whatsappLimpio}?text=${mensaje}`
                                    : '#'
                                }
                                target="_blank"
                                rel="noreferrer"
                                className={`${styles.actionBtn} ${styles.btnWa}`}
                              >
                                WhatsApp
                              </a>
                            </>
                          ) : (
                            <>
                              <Link
                                href={`/catalogo/${producto.id}`}
                                className={`${styles.actionBtn} ${styles.btnView}`}
                              >
                                Ver producto
                              </Link>

                              <button
                                onClick={() => toggleFavorito(producto.id)}
                                className={`${styles.actionBtn} ${styles.btnSave}`}
                                type="button"
                              >
                                {esFavorito ? 'Guardado' : 'Guardar'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>

              {productos.length === 0 && (
                <div className={`${styles.empty} quick-empty-shell`}>
                  <div className={styles.emptyIcon}>🔍</div>
                  <h3>No encontramos resultados</h3>
                  <p>Prueba con otra búsqueda o ajusta los filtros.</p>

                  <div style={{ marginTop: 16 }}>
                    <button
                      type="button"
                      onClick={limpiarFiltros}
                      className={`${styles.toolbarBtn} ${styles.btnClear}`}
                    >
                      Restablecer filtros
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </section>
    </main>
  )
}