'use client'

export default function CookiePreferencesButton() {
  const handleClick = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('clu_cookie_consent_v2')
      window.location.reload()
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="hover:text-white focus:outline-hidden focus:underline transition-colors bg-transparent border-0 cursor-pointer text-slate-300 text-[11px] font-semibold uppercase tracking-widest"
    >
      Cookie Preferences
    </button>
  )
}
