/** Affiche une note pondérée sur 5, ou un état "pas encore de vote". */
export function ScoreBadge({ score, voteCount }: { score: number | null; voteCount: number }) {
  if (score === null || voteCount === 0) {
    return <span className="text-sm text-slate-500">Pas encore de vote</span>;
  }

  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="text-2xl font-bold text-slate-900">{score.toFixed(1)}</span>
      <span className="text-sm text-slate-500">
        /5 · {voteCount} vote{voteCount > 1 ? 's' : ''}
      </span>
    </span>
  );
}
