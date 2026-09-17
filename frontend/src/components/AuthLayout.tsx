import type { ReactNode } from 'react'
import { IconCheck, IconClipboard } from './icons'

const FEATURES = [
  'Créez et organisez vos tâches en quelques secondes',
  'Suivez leur avancement avec des statuts clairs',
  'Retrouvez tout instantanément grâce à la recherche',
]

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-linear-to-br from-indigo-600 via-indigo-600 to-fuchsia-600 px-12 py-12 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-fuchsia-400/20 blur-3xl"
        />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
            <IconClipboard className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">Task Manager</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold leading-tight text-balance">
            Organisez votre travail, une tâche à la fois.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-indigo-100">
            Un espace simple et rapide pour garder le contrôle sur ce que vous avez à
            faire.
          </p>
          <ul className="mt-8 flex flex-col gap-3">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-indigo-50">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <IconCheck className="h-3 w-3" />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-indigo-200">
          © {new Date().getFullYear()} Task Manager. Tous droits réservés.
        </p>
      </div>

      <div className="flex w-full flex-col items-center justify-center px-4 py-12 sm:px-6 lg:w-1/2">
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <IconClipboard className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Task Manager
          </span>
        </div>

        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
