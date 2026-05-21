'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function RegistroPage() {
  const [modo, setModo] = useState<'login' | 'registro'>('registro')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMensaje('')
    setError('')

    try {
      if (modo === 'registro') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: 'https://pidelodelcampo.com',
          },
        })

        if (error) throw error

        setMensaje(
          'Tu cuenta fue creada. Revisa tu correo y confirma tu email para poder ingresar.'
        )
        setEmail('')
        setPassword('')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        setMensaje('Ingreso exitoso. Ya puedes continuar.')
        window.location.href = '/'
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top, #dcfce7 0%, #f0fdf4 18%, #ffffff 48%, #f8fafc 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: '480px',
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '28px',
          padding: '28px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#15803d',
            }}
          >
            Pidelodelcampo
          </div>

          <h1
            style={{
              margin: '10px 0 8px',
              fontSize: '34px',
              lineHeight: 1.1,
              color: '#111827',
            }}
          >
            {modo === 'registro' ? 'Crea tu cuenta' : 'Inicia sesión'}
          </h1>

          <p
            style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '14px',
              lineHeight: 1.6,
            }}
          >
            Regístrate para publicar tus productos, gestionar tu perfil y acceder al plan VIP PREMIUM.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: '#f3f4f6',
            borderRadius: '14px',
            padding: '4px',
            marginBottom: '18px',
          }}
        >
          <button
            type="button"
            onClick={() => setModo('registro')}
            style={{
              minHeight: '46px',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              background: modo === 'registro' ? '#16a34a' : 'transparent',
              color: modo === 'registro' ? '#ffffff' : '#111827',
            }}
          >
            Registrarme
          </button>

          <button
            type="button"
            onClick={() => setModo('login')}
            style={{
              minHeight: '46px',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              background: modo === 'login' ? '#16a34a' : 'transparent',
              color: modo === 'login' ? '#ffffff' : '#111827',
            }}
          >
            Ingresar
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#374151',
              }}
            >
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              required
              style={{
                width: '100%',
                minHeight: '52px',
                borderRadius: '14px',
                border: '1px solid #d1d5db',
                padding: '0 14px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#374151',
              }}
            >
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              style={{
                width: '100%',
                minHeight: '52px',
                borderRadius: '14px',
                border: '1px solid #d1d5db',
                padding: '0 14px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          {mensaje && (
            <div
              style={{
                marginBottom: '14px',
                background: '#ecfdf5',
                color: '#166534',
                border: '1px solid #bbf7d0',
                borderRadius: '14px',
                padding: '12px 14px',
                fontSize: '14px',
                lineHeight: 1.5,
              }}
            >
              {mensaje}
            </div>
          )}

          {error && (
            <div
              style={{
                marginBottom: '14px',
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
                borderRadius: '14px',
                padding: '12px 14px',
                fontSize: '14px',
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              minHeight: '54px',
              borderRadius: '14px',
              border: 'none',
              background: '#16a34a',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            {loading
              ? 'Procesando...'
              : modo === 'registro'
              ? 'Crear cuenta'
              : 'Ingresar'}
          </button>
        </form>

        <div
          style={{
            marginTop: '18px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: 1.6,
          }}
        >
          <Link
            href="/"
            style={{
              color: '#15803d',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  )
}