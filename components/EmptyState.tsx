interface EmptyStateProps {
  icon: string
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-6xl mb-4 opacity-50">{icon}</div>
      <h3 className="text-xl font-bold text-navy dark:text-white mb-2">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-6">{description}</p>
      {actionLabel && actionHref && (
        <a href={actionHref}
           className="bg-amber-400 text-navy font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-amber-500 transition-colors">
          {actionLabel}
        </a>
      )}
    </div>
  )
}
