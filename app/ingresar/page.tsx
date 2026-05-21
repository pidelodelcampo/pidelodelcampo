'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 38%, #f8fafc 100%)',
    padding: '16px',
    color: '#111827',
  } as React.CSSProperties,
  wrap: {
    maxWidth: '520px',
    margin: '0 auto',
  } as React.CSSProperties,
  card: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '24px',
    padding: '20px',
    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.06)',
  } as React.CSSProperties,
  top: {
    display: 'flex',
    gap: '10px',
    marginBottom: '18px',
    flexWrap: 'wrap',
  } as React.CSSProperties,
  tab: {
    minHeight: '44px',
    padding: '0 16px',
    borderRadius: '14px',
    border: '1px solid #d1d5db',
    background: '#ffffff',
    fontWeight: 800,
    cursor: 'pointer',
  } as React.CSSProperties,
  tabActive: {
    background: '#16a34a',
    color: '#ffffff',
    border: '1px solid #16a34a',
  } as React.CSSProperties,
  title: {
    margin: '0 0 8px',
    fontSize: '32px',
    lineHeight: 1.05,
    fontWeight: 900,
  } as React.CSSProperties,
  text: {
    margin: '0 0 18px',
    color: '#6b7280',
    lineHeight: 1.6,
    fontSize: '14px',
  } as React.CSSProperties,
  field: {
    display: 'grid',
    gap: '8px',
    marginBottom: '12px',
  } as React.CSSProperties,
  label: {
    fontSize: '14px',
    fontWeight: 700,
  } as React.CSSProperties,
  input: {
    width: '100%',
    minHeight: '52px',
    borderRadius: '14px',
    border: '1px solid #d1d5db',
    padding: '0 14px',
    fontSize: '14px',
    outline: 'none',
  } as React.CSSProperties,
  button: {
    width: '100%',
    minHeight: '52px',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
    color: '#111827',
    fontWeight: 900,
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '8px',
  } as React.CSSProperties,
  info: {
    background: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    borderRadius: '14px',
    padding: '12px 14px',
    fontSize: '14px',
    marginTop: '12px',
  } as React.CSSProperties,
  error: {
    background: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '14px',
    padding: '12px 14px',
    fontSize: '14px',
    marginTop: '12px',
  } as React.CSSProperties,
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '16px',
  } as React.CSSProperties,
  link: {
    color: '#15803d',
    fontWeight: 800,
    textDecoration: 'none',
    fontSize: '14px',
  } as React.CSSProperties,
}

export default function IngresarPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/perfil'

  const [modo, setModo] = useState<'ingresar' | 'registro'>('ingresar')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace(next)
    })
  }, [next, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInfo('')

    if (!email || !password) {
      setLoading(false)
      setError('Completa correo y contraseña.')
      return
    }

    if (modo === 'registro') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/perfil`,
        },
      })

      setLoading(false)

      if (error) {
        setError(error.message)
        return
      }

      if (data.session) {
        router.replace(next)
        return
      }

      setInfo('Te enviamos un correo de confirmación. Revisa tu email y luego ingresa.')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.replace(next)
  }

  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.card}>
          <div style={styles.top}>
            <button
              type="button"
              onClick={() => setModo('ingresar')}
              style={{
                ...styles.tab,
                ...(modo === 'ingresar' ? styles.tabActive : {}),
              }}
            >
              Ingresar
            </button>

            <button
              type="button"
              onClick={() => setModo('registro')}
              style={{
                ...styles.tab,
                ...(modo === 'registro' ? styles.tabActive : {}),
              }}
            >
              Crear cuenta
            </button>
          </div>

          <h1 style={styles.title}>
            {modo === 'ingresar' ? 'Ingresa a tu cuenta' : 'Crea tu cuenta'}
          </h1>

          <p style={styles.text}>
            {modo === 'ingresar'
              ? 'Entra para publicar, administrar tus productos y ver tu perfil.'
              : 'Regístrate con tu correo para publicar tus productos.'}
          </p>

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Correo</label>
              <input
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Contraseña</label>
              <input
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading
                ? 'Cargando...'
                : modo === 'ingresar'
                ? 'Ingresar'
                : 'Crear cuenta'}
            </button>
          </form>

          {info ? <div style={styles.info}>{info}</div> : null}
          {error ? <div style={styles.error}>{error}</div> : null}

          <div style={styles.footer}>
            <Link href="/" style={styles.link}>
              Ir al inicio
            </Link>

            <Link href="/catalogo" style={styles.link}>
              Ver catálogo
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}