'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type ChangelogData = {
  version: string;
  entries: { hash: string; message: string; date: string }[];
};

export default function ChangelogPage() {
  const [data, setData] = useState<ChangelogData | null>(null);

  useEffect(() => {
    fetch('/api/changelog').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div className="p-6 text-muted">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-muted hover:text-foreground text-sm transition-colors">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          Changelog <span className="text-accent font-mono text-lg">v{data.version}</span>
        </h1>
      </div>
      <ul className="space-y-2">
        {data.entries.map(e => (
          <li key={e.hash} className="flex items-baseline gap-3 py-2 border-b border-border text-sm">
            <span className="text-muted font-mono text-xs w-24 shrink-0">{e.date}</span>
            <code className="text-accent font-mono text-xs shrink-0">{e.hash}</code>
            <span className="text-foreground">{e.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
