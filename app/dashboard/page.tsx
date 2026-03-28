// app/dashboard/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Todo = { id: string; title: string; done: boolean }

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [userName, setUserName] = useState('Familie')
  const [todos, setTodos] = useState<Todo[]>([
    { id: '1', title: 'Kita-Gebühren überweisen', done: false },
    { id: '2', title: 'Zahnarzt anrufen', done: true },
    { id: '3', title: 'Sportkleidung kaufen', done: false },
  ])
  const [weather, setWeather] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUserName(data.user.user_metadata?.full_name?.split(' ')[0] || 'Familie')
    })

    fetch('https://api.open-meteo.com/v1/forecast?latitude=49.95&longitude=10.17&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Europe/Berlin&forecast_days=7')
      .then(r => r.json())
      .then(setWeather)
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const dayLabels = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
  const today = new Date()

  return (
    <div className="min-h-screen bg-[#f0f4f8]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-[#2d6a9f] rounded-xl flex items-center justify-center text-white font-bold text-lg">🏠</div>
          <div className="flex-1">
            <div className="text-lg font-semibold text-[#1a3a5c]" style={{ fontFamily: "'DM Serif Display', serif" }}>FamilyHub</div>
            <div className="text-xs text-gray-500">Hallo, {userName} 👋</div>
          </div>
          <input className="hidden md:block px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 w-48 focus:outline-none focus:border-[#2d6a9f]" placeholder="Suchen..." />
          <button onClick={handleLogout} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:border-[#2d6a9f] hover:text-[#2d6a9f] transition-colors">Abmelden</button>
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-5xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-24">

        {/* Kalender Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[#1a3a5c] flex items-center gap-2">📅 Kalender</h2>
            <a href="/kalender" className="text-xs text-[#2d6a9f] bg-blue-50 px-2 py-1 rounded">Öffnen →</a>
          </div>
          <div className="text-xs text-gray-500 mb-2">{today.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}</div>
          <div className="grid grid-cols-7 text-center text-xs gap-1">
            {['Mo','Di','Mi','Do','Fr','Sa','So'].map(d => <div key={d} className="text-gray-400 py-1">{d}</div>)}
            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
              <div key={d} className={`py-1 rounded cursor-pointer hover:bg-blue-50 ${d === today.getDate() ? 'bg-[#2d6a9f] text-white' : 'text-gray-700'}`}>
                {d}
              </div>
            ))}
          </div>
        </div>

        {/* To-do */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[#1a3a5c] flex items-center gap-2">✅ To-do Liste</h2>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">{todos.filter(t => !t.done).length} offen</span>
          </div>
          <div className="space-y-2">
            {todos.map(todo => (
              <div key={todo.id} onClick={() => toggleTodo(todo.id)}
                className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors ${todo.done ? 'bg-[#2d6a9f] border-[#2d6a9f]' : 'border-gray-300'}`}>
                  {todo.done && <span className="text-white text-xs">✓</span>}
                </div>
                <span className={`text-sm ${todo.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{todo.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Wetter */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[#1a3a5c] flex items-center gap-2">⛅ Wetter</h2>
            <a href="/wetter" className="text-xs text-[#2d6a9f] bg-blue-50 px-2 py-1 rounded">Details →</a>
          </div>
          {weather ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-3xl font-bold text-[#1a3a5c]">{weather.current_weather?.temperature}°C</div>
                  <div className="text-xs text-gray-500">Grettstadt</div>
                </div>
                <div className="text-4xl">{weather.current_weather?.weathercode <= 1 ? '☀️' : weather.current_weather?.weathercode <= 3 ? '⛅' : '🌧️'}</div>
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {weather.daily?.time?.slice(0, 7).map((date: string, i: number) => {
                  const d = new Date(date)
                  const code = weather.daily.weathercode[i]
                  return (
                    <div key={date} className="flex-1 min-w-0 text-center bg-gray-50 rounded-lg p-2">
                      <div className="text-xs text-gray-400">{dayLabels[d.getDay()]}</div>
                      <div className="text-base my-1">{code <= 1 ? '☀️' : code <= 3 ? '⛅' : '🌧️'}</div>
                      <div className="text-xs font-medium text-[#1a3a5c]">{weather.daily.temperature_2m_max[i]}°</div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : <div className="text-sm text-gray-400 text-center py-4">Wetter wird geladen...</div>}
        </div>

        {/* Feiertage Bayern */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h2 className="font-semibold text-[#1a3a5c] mb-3 flex items-center gap-2">🎉 Feiertage Bayern</h2>
          {[
            { date: '18. Apr.', name: 'Karfreitag' },
            { date: '21. Apr.', name: 'Ostermontag' },
            { date: '01. Mai', name: 'Tag der Arbeit' },
            { date: '29. Mai', name: 'Christi Himmelfahrt' },
            { date: '09. Jun.', name: 'Pfingstmontag' },
            { date: '19. Jun.', name: 'Fronleichnam' },
          ].map(({ date, name }) => (
            <div key={name} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0 text-sm">
              <span className="text-gray-400 text-xs w-14 flex-shrink-0">{date}</span>
              <span className="text-gray-700">{name}</span>
            </div>
          ))}
        </div>

        {/* Einkaufsliste */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[#1a3a5c] flex items-center gap-2">🛒 Einkaufsliste</h2>
            <a href="/einkauf" className="text-xs text-[#2d6a9f] bg-blue-50 px-2 py-1 rounded">Öffnen →</a>
          </div>
          {['🥛 Milch', '🍞 Vollkornbrot', '🧀 Käse', '🍎 Äpfel', '🥚 Eier'].map(item => (
            <div key={item} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0 text-sm text-gray-700">{item}</div>
          ))}
        </div>

        {/* Rezepte */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[#1a3a5c] flex items-center gap-2">🍳 Rezepte</h2>
            <a href="/rezepte" className="text-xs text-[#2d6a9f] bg-blue-50 px-2 py-1 rounded">Alle →</a>
          </div>
          {[
            { emoji: '🍝', name: 'Pasta Bolognese', info: '30 Min · 4 Pers.' },
            { emoji: '🥗', name: 'Caesar Salad', info: '15 Min · 2 Pers.' },
            { emoji: '🍲', name: 'Linsensuppe', info: '45 Min · 6 Pers.' },
          ].map(r => (
            <div key={r.name} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center text-xl flex-shrink-0">{r.emoji}</div>
              <div>
                <div className="text-sm font-medium text-gray-700">{r.name}</div>
                <div className="text-xs text-gray-400">{r.info}</div>
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-10">
        {[
          { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
          { href: '/kalender', icon: '📅', label: 'Kalender' },
          { href: '/todos', icon: '✅', label: 'To-do' },
          { href: '/einkauf', icon: '🛒', label: 'Einkauf' },
          { href: '/rezepte', icon: '🍳', label: 'Rezepte' },
          { href: '/wetter', icon: '⛅', label: 'Wetter' },
        ].map(({ href, icon, label }) => (
          <a key={href} href={href}
            className="flex-1 flex flex-col items-center py-2 text-gray-400 hover:text-[#2d6a9f] transition-colors">
            <span className="text-xl">{icon}</span>
            <span className="text-xs mt-0.5">{label}</span>
          </a>
        ))}
      </nav>
    </div>
  )
}