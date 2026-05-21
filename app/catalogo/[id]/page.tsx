'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { supabase } from '@/lib/supabase'

type ProductoDetalle = {
  id: string
  nombre_producto: string
  categoria: string
  subcategoria: string | null
  descripcion: string | null
  departamento: string
  municipio: string
  precio: number
  tipo_venta: string
  nombre_vendedor: string
  telefono: string | null
  whatsapp: string | null
  plan: 'free' | 'vip'
  vip_activo: boolean
  estado: string
  likes_count: number
  allow_call: boolean
  allow_whatsapp: boolean
  published_at: string | null
  created_at: string
}

type ImagenProducto = {
  id: string
  image_url: string
  sort_order: number
}

type PagoVip = {
  payment_status: string | null
}

function formatCOP(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function normalizePhone(value?: string | null) {
  return (value || '').replace(/\D/g, '')
}

function isNuevo(fecha?: string | null) {
  if (!fecha) return false
  const now = new Date().getTime()
  const created = new Date(fecha).getTime()
  return now - created <= 2 * 24 * 60 * 60 * 1000
}

function formatShortDate(value?: string | null) {
  if (!value) return 'Sin fecha'
  return new Date(value).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getVipStatus(plan: 'free' | 'vip', vipActivo: boolean, paymentStatus?: string | null) {
  const pago = (paymentStatus || '').toLowerCase()

  const vipConfirmado =
    plan === 'vip' && (pago === 'approved' || (!paymentStatus && vipActivo))

  const vipPendiente =
    plan === 'vip' &&
    !vipConfirmado &&
    ['', 'pending', 'in_process', 'authorized', 'processing'].includes(pago || '')

  const vipRechazado =
    plan === 'vip' &&
    ['rejected', 'cancelled', 'failed'].includes(pago)

  return {
    vipConfirmado,
    vipPendiente,
    vipRechazado,
  }
}

const s: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #effdf5 0%, #ffffff 45%, #f8fafc 100%)',
    padding: '12px',
    color: '#111827',
  },
  wrap: {
    maxWidth: '1180px',
    margin: '0 auto',
  },
  topbar: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '14px',
  },
  btn: {
    minHeight: '48px',
    borderRadius: '14px',
    padding: '0 16px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    fontWeight: 900,
    fontSize: '14px',
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#111827',
    cursor: 'pointer',
  },
  btnGreen: {
    background: '#16a34a',
    color: '#fff',
    border: 'none',
  },
  btnGold: {
    background: 'linear-gradient(135deg,#facc15 0%,#f59e0b 100%)',
    color: '#111827',
    border: 'none',
    boxShadow: '0 12px 26px rgba(245,158,11,.22)',
  },
  btnSoft: {
    background: '#ecfdf5',
    color: '#166534',
    border: '1px solid #bbf7d0',
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    display: 'grid',
    gap: '16px',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '28px',
    padding: '16px',
    boxShadow: '0 12px 30px rgba(15,23,42,.06)',
    isolation: 'isolate',
  },
  heroGlow: {
    position: 'absolute',
    inset: '-10%',
    background:
      'radial-gradient(circle at 85% 18%, rgba(34,197,94,0.10), transparent 16%), radial-gradient(circle at 10% 86%, rgba(250,204,21,0.12), transparent 18%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  heroContentWrap: {
    position: 'relative',
    zIndex: 1,
  },
  gallery: {
    display: 'grid',
    gap: '10px',
  },
  mainMedia: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '22px',
    background: '#f3f4f6',
  },
  mainImage: {
    width: '100%',
    height: '340px',
    objectFit: 'cover',
    borderRadius: '22px',
    background: '#f3f4f6',
    display: 'block',
  },
  imageOverlay: {
    position: 'absolute',
    left: '12px',
    bottom: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.92)',
    color: '#14532d',
    fontSize: '12px',
    fontWeight: 900,
    backdropFilter: 'blur(8px)',
  },
  thumbs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '8px',
  },
  thumbBtn: {
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: '14px',
  },
  thumb: {
    width: '100%',
    height: '84px',
    objectFit: 'cover',
    borderRadius: '14px',
    border: '2px solid transparent',
    background: '#f3f4f6',
    display: 'block',
  },
  content: {
    display: 'grid',
    gap: '12px',
  },
  badges: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  badge: {
    borderRadius: '999px',
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: 900,
    border: '1px solid transparent',
  },
  badgeCat: {
    background: '#ecfdf5',
    color: '#166534',
    borderColor: '#bbf7d0',
  },
  badgeVip: {
    background: 'linear-gradient(135deg,#facc15 0%,#f59e0b 100%)',
    color: '#111827',
    borderColor: 'rgba(245,158,11,.22)',
  },
  badgeVipPending: {
    background: '#fff7ed',
    color: '#9a3412',
    borderColor: '#fed7aa',
  },
  badgeVipRejected: {
    background: '#fef2f2',
    color: '#b91c1c',
    borderColor: '#fecaca',
  },
  badgeNew: {
    background: '#dbeafe',
    color: '#1d4ed8',
    borderColor: '#bfdbfe',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(28px, 7vw, 42px)',
    lineHeight: 1.05,
    fontWeight: 900,
    letterSpacing: '-0.03em',
  },
  seller: {
    margin: 0,
    color: '#4b5563',
    fontSize: '15px',
    lineHeight: 1.6,
  },
  price: {
    fontSize: '34px',
    fontWeight: 900,
    color: '#15803d',
    lineHeight: 1,
  },
  meta: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  metaItem: {
    borderRadius: '999px',
    background: '#f3f4f6',
    color: '#374151',
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: 800,
    border: '1px solid #e5e7eb',
  },
  quickStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '10px',
    marginTop: '2px',
  },
  statCard: {
    background: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: '18px',
    padding: '14px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: 700,
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '22px',
    fontWeight: 900,
    color: '#14532d',
    lineHeight: 1.1,
  },
  actions: {
    display: 'grid',
    gap: '10px',
    marginTop: '12px',
  },
  notice: {
    marginTop: '12px',
    borderRadius: '16px',
    padding: '12px 14px',
    fontSize: '14px',
    lineHeight: 1.6,
    border: '1px solid transparent',
  },
  noticeVip: {
    background: '#fff7ed',
    borderColor: '#fed7aa',
    color: '#9a3412',
  },
  noticePending: {
    background: '#fffbeb',
    borderColor: '#fde68a',
    color: '#92400e',
  },
  noticeBasic: {
    background: '#eff6ff',
    borderColor: '#bfdbfe',
    color: '#1d4ed8',
  },
  card: {
    marginTop: '14px',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '24px',
    padding: '18px',
    boxShadow: '0 12px 28px rgba(15,23,42,.05)',
  },
  sectionTitle: {
    margin: '0 0 10px',
    fontSize: '22px',
    fontWeight: 900,
  },
  text: {
    margin: 0,
    color: '#4b5563',
    lineHeight: 1.7,
    whiteSpace: 'pre-wrap',
  },
  sellerGrid: {
    display: 'grid',
    gap: '10px',
  },
  sellerItem: {
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    background: '#f8fafc',
    padding: '14px',
  },
  sellerItemLabel: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: 800,
    marginBottom: '4px',
  },
  sellerItemValue: {
    fontSize: '15px',
    color: '#111827',
    fontWeight: 800,
    lineHeight: 1.5,
    wordBreak: 'break-word',
  },
  empty: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '24px',
    padding: '24px',
    textAlign: 'center',
  },
}

export default function ProductoDetallePage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params?.id || '')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [producto, setProducto] = useState<ProductoDetalle | null>(null)
  const [imagenes, setImagenes] = useState<ImagenProducto[]>([])
  const [imagenActiva, setImagenActiva] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)

  useEffect(() => {
    let activo = true

    const cargarProducto = async () => {
      if (!id) return

      setLoading(true)
      setError('')

      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('estado', 'published')
        .single()

      if (!activo) return

      if (productError || !productData) {
        setProducto(null)
        setError('Producto no encontrado o ya no está disponible.')
        setLoading(false)
        return
      }

      setProducto(productData as ProductoDetalle)

      const [imagesResp, vipResp] = await Promise.all([
        supabase
          .from('product_images')
          .select('id, image_url, sort_order')
          .eq('product_id', id)
          .order('sort_order', { ascending: true }),
        supabase
          .from('vip_payments')
          .select('payment_status')
          .eq('product_id', id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ])

      if (!activo) return

      const listaImagenes = (imagesResp.data || []) as ImagenProducto[]
      const pago = (vipResp.data || null) as PagoVip | null

      setImagenes(listaImagenes)
      setImagenActiva(listaImagenes[0]?.image_url || '')
      setPaymentStatus(pago?.payment_status || null)
      setLoading(false)
    }

    cargarProducto()

    return () => {
      activo = false
    }
  }, [id])

  const telefono = useMemo(
    () => normalizePhone(producto?.telefono),
    [producto?.telefono]
  )

  const whatsapp = useMemo(
    () => normalizePhone(producto?.whatsapp || producto?.telefono),
    [producto?.whatsapp, producto?.telefono]
  )

  const mensajeWhatsApp = useMemo(() => {
    if (!producto) return ''
    return encodeURIComponent(
      `Hola, me interesa ${producto.nombre_producto} publicado en Pidelo del Campo.`
    )
  }, [producto])

  if (loading) {
    return (
      <main style={s.page}>
        <div style={s.wrap}>
          <div style={s.empty}>
            <h2 style={{ marginTop: 0 }}>Cargando producto...</h2>
            <p style={s.text}>Espera un momento mientras traemos la publicación.</p>
          </div>
        </div>
      </main>
    )
  }

  if (!producto) {
    return (
      <main style={s.page}>
        <div style={s.wrap}>
          <div style={s.topbar}>
            <button onClick={() => router.back()} style={s.btn} type="button">
              ← Volver
            </button>
            <Link href="/catalogo" style={s.btn}>
              Ir al catálogo
            </Link>
          </div>

          <div style={s.empty}>
            <h2 style={{ marginTop: 0 }}>Producto no encontrado</h2>
            <p style={s.text}>{error || 'Esta publicación no está disponible.'}</p>
          </div>
        </div>
      </main>
    )
  }

  const imagenPrincipal = imagenActiva || imagenes[0]?.image_url || '/logo.png'
  const esNuevo = isNuevo(producto.published_at || producto.created_at)

  const { vipConfirmado, vipPendiente, vipRechazado } = getVipStatus(
    producto.plan,
    producto.vip_activo,
    paymentStatus
  )

  const mostrarCall = !!telefono && !!producto.allow_call
  const mostrarWhatsapp = !!whatsapp && !!producto.allow_whatsapp

  return (
    <main style={s.page}>
      <style jsx global>{`
        .producto-detalle-layout {
          display: grid;
          gap: 14px;
        }

        .producto-hero-grid {
          display: grid;
          gap: 16px;
        }

        .producto-card-hover {
          transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
        }

        .producto-card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 40px rgba(15,23,42,.08);
          border-color: #dce8e2;
        }

        .producto-main-image {
          transition: transform 360ms ease;
        }

        .producto-card-hover:hover .producto-main-image {
          transform: scale(1.03);
        }

        .producto-thumb-active {
          box-shadow: 0 0 0 2px rgba(22,163,74,.18);
        }

        .producto-pulse-chip {
          animation: chipFloat 4.4s ease-in-out infinite;
        }

        .producto-pulse-chip:nth-child(2) {
          animation-delay: .6s;
        }

        .producto-pulse-chip:nth-child(3) {
          animation-delay: 1.1s;
        }

        .producto-pulse-chip:nth-child(4) {
          animation-delay: 1.6s;
        }

        .producto-info-grid {
          display: grid;
          gap: 14px;
        }

        @keyframes chipFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @media (min-width: 980px) {
          .producto-hero-grid {
            grid-template-columns: minmax(0, 1.08fr) minmax(360px, .92fr);
            align-items: start;
          }

          .producto-info-grid {
            grid-template-columns: minmax(0, 1fr) minmax(320px, .9fr);
          }

          .producto-actions-row {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>

      <div style={s.wrap}>
        <div style={s.topbar}>
          <button onClick={() => router.back()} style={s.btn} type="button">
            ← Volver
          </button>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/catalogo" style={s.btn}>
              Ver catálogo
            </Link>
            <Link href="/publicar" style={{ ...s.btn, ...s.btnGold }}>
              🌱 Publicar producto
            </Link>
          </div>
        </div>

        <section style={s.hero} className="producto-card-hover">
          <div style={s.heroGlow} />
          <div style={s.heroContentWrap} className="producto-hero-grid">
            <div style={s.gallery}>
              <div style={s.mainMedia}>
                <img
                  src={imagenPrincipal}
                  alt={producto.nombre_producto}
                  style={s.mainImage}
                  className="producto-main-image"
                  onError={(e) => {
                    e.currentTarget.src = '/logo.png'
                  }}
                />

                <div style={s.imageOverlay}>
                  📍 {producto.municipio}, {producto.departamento}
                </div>
              </div>

              {imagenes.length > 1 && (
                <div style={s.thumbs}>
                  {imagenes.map((img) => {
                    const activa = imagenPrincipal === img.image_url

                    return (
                      <button
                        key={img.id}
                        type="button"
                        style={s.thumbBtn}
                        onClick={() => setImagenActiva(img.image_url)}
                        className={activa ? 'producto-thumb-active' : ''}
                        aria-label="Ver imagen del producto"
                      >
                        <img
                          src={img.image_url}
                          alt={producto.nombre_producto}
                          style={{
                            ...s.thumb,
                            borderColor: activa ? '#16a34a' : 'transparent',
                          }}
                          onError={(e) => {
                            e.currentTarget.src = '/logo.png'
                          }}
                        />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div style={s.content}>
              <div style={s.badges}>
                <span style={{ ...s.badge, ...s.badgeCat }} className="producto-pulse-chip">
                  {producto.categoria}
                </span>

                {vipConfirmado && (
                  <span style={{ ...s.badge, ...s.badgeVip }} className="producto-pulse-chip">
                    PREMIUM VIP
                  </span>
                )}

                {vipPendiente && (
                  <span
                    style={{ ...s.badge, ...s.badgeVipPending }}
                    className="producto-pulse-chip"
                  >
                    VIP EN ESPERA DE PAGO
                  </span>
                )}

                {vipRechazado && (
                  <span
                    style={{ ...s.badge, ...s.badgeVipRejected }}
                    className="producto-pulse-chip"
                  >
                    VIP NO ACTIVO
                  </span>
                )}

                {esNuevo && !vipConfirmado && (
                  <span style={{ ...s.badge, ...s.badgeNew }} className="producto-pulse-chip">
                    Nuevo
                  </span>
                )}
              </div>

              <h1 style={s.title}>{producto.nombre_producto}</h1>
              <p style={s.seller}>Publicado por {producto.nombre_vendedor}</p>

              <div style={s.price}>{formatCOP(producto.precio)}</div>

              <div style={s.meta}>
                <span style={s.metaItem}>{producto.departamento}</span>
                <span style={s.metaItem}>{producto.municipio}</span>
                <span style={s.metaItem}>{producto.tipo_venta}</span>
                <span style={s.metaItem}>{producto.likes_count || 0} me gusta</span>
                {producto.subcategoria ? (
                  <span style={s.metaItem}>{producto.subcategoria}</span>
                ) : null}
              </div>

              <div style={s.quickStats}>
                <div style={s.statCard}>
                  <div style={s.statLabel}>Publicado</div>
                  <div style={s.statValue}>
                    {formatShortDate(producto.published_at || producto.created_at)}
                  </div>
                </div>

                <div style={s.statCard}>
                  <div style={s.statLabel}>Estado</div>
                  <div style={s.statValue}>
                    {vipConfirmado
                      ? 'VIP'
                      : vipPendiente
                      ? 'Pendiente'
                      : 'Visible'}
                  </div>
                </div>
              </div>

              <div style={s.actions} className="producto-actions-row">
                {mostrarCall ? (
                  <a
                    href={`tel:${telefono}`}
                    style={{
                      ...s.btn,
                      ...(vipConfirmado ? s.btnGreen : s.btnSoft),
                    }}
                  >
                    📞 Llamar
                  </a>
                ) : null}

                {mostrarWhatsapp ? (
                  <a
                    href={`https://wa.me/${whatsapp}?text=${mensajeWhatsApp}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      ...s.btn,
                      ...(vipConfirmado ? s.btnGold : s.btnGreen),
                    }}
                  >
                    💬 WhatsApp
                  </a>
                ) : null}
              </div>

              {vipConfirmado ? (
                <div style={{ ...s.notice, ...s.noticeVip }}>
                  Este producto tiene visibilidad VIP confirmada y su publicación ya cuenta con el estado premium activo.
                </div>
              ) : vipPendiente ? (
                <div style={{ ...s.notice, ...s.noticePending }}>
                  Esta publicación solicitó VIP, pero todavía está esperando confirmación de pago. Por eso aún no se muestra como VIP activa.
                </div>
              ) : vipRechazado ? (
                <div style={{ ...s.notice, ...s.noticePending }}>
                  Esta publicación tuvo una solicitud VIP, pero el pago no quedó aprobado. Se muestra como una publicación normal.
                </div>
              ) : (
                <div style={{ ...s.notice, ...s.noticeBasic }}>
                  Puedes revisar esta publicación y contactar al vendedor con los medios disponibles.
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="producto-info-grid">
          <section style={s.card}>
            <h2 style={s.sectionTitle}>Descripción</h2>
            <p style={s.text}>
              {producto.descripcion?.trim() || 'El vendedor no agregó descripción adicional.'}
            </p>
          </section>

          <section style={s.card}>
            <h2 style={s.sectionTitle}>Datos del vendedor</h2>

            <div style={s.sellerGrid}>
              <div style={s.sellerItem}>
                <div style={s.sellerItemLabel}>Nombre</div>
                <div style={s.sellerItemValue}>{producto.nombre_vendedor}</div>
              </div>

              <div style={s.sellerItem}>
                <div style={s.sellerItemLabel}>Ubicación</div>
                <div style={s.sellerItemValue}>
                  {producto.municipio}, {producto.departamento}
                </div>
              </div>

              <div style={s.sellerItem}>
                <div style={s.sellerItemLabel}>Teléfono</div>
                <div style={s.sellerItemValue}>{telefono || 'No disponible'}</div>
              </div>

              <div style={s.sellerItem}>
                <div style={s.sellerItemLabel}>WhatsApp</div>
                <div style={s.sellerItemValue}>{whatsapp || 'No disponible'}</div>
              </div>
            </div>

            <div style={s.actions}>
              <Link href="/catalogo" style={s.btn}>
                Ver más productos
              </Link>

              <Link href="/publicar" style={{ ...s.btn, ...s.btnGold }}>
                🌱 Publicar el mío
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}