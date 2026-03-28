// app/login/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// Wetter-Typ
type WeatherData = {
  temperature: number
  windspeed: number
  relativehumidity: number
  weathercode: number
}

// Wetter-Code → Beschreibung + Emoji
function getWeatherInfo(code: number): { desc: string; emoji: string } {
  if (code === 0) return { desc: 'Klar', emoji: '☀️' }
  if (code <= 2) return { desc: 'Leicht bewölkt', emoji: '⛅' }
  if (code <= 3) return { desc: 'Bewölkt', emoji: '☁️' }
  if (code <= 67) return { desc: 'Regen', emoji: '🌧️' }
  if (code <= 77) return { desc: 'Schnee', emoji: '❄️' }
  return { desc: 'Gewitter', emoji: '⛈️' }
}

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [tab, setTab] = useState<'login' | 'register' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [weather, setWeather] = useState<WeatherData | null>(null)

  // Wetter laden
  useEffect(() => {
    fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=49.95&longitude=10.17' +
      '&current_weather=true&hourly=relativehumidity_2m&timezone=Europe/Berlin'
    )
      .then(r => r.json())
      .then(d => setWeather({
        temperature: d.current_weather.temperature,
        windspeed: d.current_weather.windspeed,
        weathercode: d.current_weather.weathercode,
        relativehumidity: d.hourly.relativehumidity_2m[new Date().getHours()]
      }))
      .catch(() => {})
  }, [])

  const handleLogin = async () => {
    setError(''); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('E-Mail oder Passwort falsch. Bitte erneut versuchen.')
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  const handleRegister = async () => {
    setError(''); setSuccess(''); setLoading(true)
    if (password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen haben.')
      setLoading(false); return
    }
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } }
    })
    if (error) setError('Registrierung fehlgeschlagen: ' + error.message)
    else setSuccess('Bestätigungs-E-Mail wurde gesendet! Bitte prüfe deinen Posteingang.')
    setLoading(false)
  }

  const handleReset = async () => {
    setError(''); setSuccess(''); setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard`
    })
    if (error) setError('E-Mail konnte nicht gesendet werden.')
    else setSuccess('Reset-Link wurde an deine E-Mail gesendet!')
    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
  }

  const wi = weather ? getWeatherInfo(weather.weathercode) : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] p-4">
      <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-xl" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        
        {/* Linke Seite: Branding + Wetter */}
        <div className="hidden md:flex w-5/12 flex-col justify-between p-8 text-white"
          style={{ background: 'linear-gradient(145deg, #1a3a5c 0%, #2d6a9f 60%, #4a9fd4 100%)' }}>
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🏠</div>
              <div>
                <div className="text-xl font-bold" style={{ fontFamily: "'DM Serif Display', serif" }}>FamilyHub</div>
                <div className="text-xs opacity-70">Alles für deine Familie</div>
              </div>
            </div>
            <h2 className="text-2xl mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Dein digitaler Familienassistent
            </h2>
            <p className="text-sm opacity-75">Kalender, Aufgaben, Einkauf & mehr — alles an einem Ort.</p>
          </div>

          {/* Wetter-Widget */}
          {weather && wi && (
            <div className="bg-white/10 rounded-xl p-4 border border-white/20">
              <div className="text-xs opacity-70 mb-2">📍 Grettstadt, Bayern</div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-4xl font-semibold">{weather.temperature}°C</div>
                  <div className="text-sm opacity-85">{wi.desc}</div>
                </div>
                <div className="text-5xl">{wi.emoji}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  ['Wind', `${weather.windspeed} km/h`],
                  ['Luftfeuchte', `${weather.relativehumidity}%`],
                ].map(([label, val]) => (
                  <div key={label} className="bg-white/10 rounded-lg px-2 py-1 text-xs">
                    <span className="opacity-60 block">{label}</span>{val}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rechte Seite: Login-Form */}
        <div className="flex-1 bg-[#f0f4f8] p-8 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl text-[#1a3a5c]" style={{ fontFamily: "'DM Serif Display', serif" }}>
              {tab === 'reset' ? 'Passwort zurücksetzen' : 'Willkommen zurück'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {tab === 'reset' ? 'Gib deine E-Mail ein.' : 'Bitte meld dich an oder erstelle ein Konto.'}
            </p>
          </div>

          {tab !== 'reset' && (
            <div className="flex bg-gray-200 rounded-lg p-1 mb-5">
              {(['login', 'register'] as const).map(t => (
                <button key={t} onClick={() => { setTab(t); setError(''); setSuccess('') }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${tab === t ? 'bg-white text-[#2d6a9f] shadow' : 'text-gray-500'}`}>
                  {t === 'login' ? 'Anmelden' : 'Registrieren'}
                </button>
              ))}
            </div>
          )}

          {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 text-sm mb-4">{error}</div>}
          {success && <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg px-3 py-2 text-sm mb-4">{success}</div>}

          <div className="space-y-3">
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#2d6a9f] focus:ring-2 focus:ring-[#2d6a9f]/20 bg-white"
                  placeholder="Max Mustermann" />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">E-Mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#2d6a9f] focus:ring-2 focus:ring-[#2d6a9f]/20 bg-white"
                placeholder="max@familie.de" />
            </div>
            {tab !== 'reset' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Passwort</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#2d6a9f] focus:ring-2 focus:ring-[#2d6a9f]/20 bg-white"
                  placeholder="••••••••" />
                {tab === 'login' && (
                  <div className="text-right mt-1">
                    <button onClick={() => setTab('reset')} className="text-xs text-[#2d6a9f]">Passwort vergessen?</button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button onClick={tab === 'login' ? handleLogin : tab === 'register' ? handleRegister : handleReset}
            disabled={loading}
            className="w-full mt-4 py-2.5 bg-[#2d6a9f] text-white rounded-lg text-sm font-medium hover:bg-[#1a3a5c] transition-colors disabled:opacity-50">
            {loading ? 'Bitte warten...' : tab === 'login' ? 'Anmelden' : tab === 'register' ? 'Konto erstellen' : 'Link senden'}
          </button>

          {tab === 'reset' && (
            <button onClick={() => setTab('login')} className="w-full mt-2 text-sm text-[#2d6a9f]">← Zurück zum Login</button>
          )}

          {tab !== 'reset' && (
            <>
              <div className="flex items-center gap-2 my-3 text-gray-400 text-xs">
                <div className="flex-1 h-px bg-gray-200" />oder<div className="flex-1 h-px bg-gray-200" />
              </div>
              <button onClick={handleGoogle}
                className="w-full py-2.5 border border-gray-300 rounded-lg text-sm font-medium bg-white hover:border-[#2d6a9f] transition-colors flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Mit Google {tab === 'login' ? 'anmelden' : 'registrieren'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}