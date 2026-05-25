function StatsCard({ title, value, subtitle, tone = 'gold' }) {
  const toneClass = {
    gold: 'text-luxuryGold',
    success: 'text-luxurySuccess',
    warning: 'text-luxuryWarning',
    danger: 'text-luxuryDanger',
    positive: 'text-luxurySuccess',
    neutral: 'text-luxuryMuted'
  }[tone]

  return (
    <article className="panel-card p-3 sm:p-4">
      <p className="text-xs sm:text-sm text-luxuryMuted">{title}</p>
      <h3 className={`mt-1 sm:mt-2 text-xl sm:text-2xl font-bold ${toneClass}`}>{value}</h3>
      <p className="mt-1 text-[10px] sm:text-xs text-luxuryMuted">{subtitle}</p>
    </article>
  )
}

export default StatsCard
