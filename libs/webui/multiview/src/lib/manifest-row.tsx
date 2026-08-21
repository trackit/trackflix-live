import { useState } from 'react';
import { Check } from 'lucide-react';

interface ManifestRowProps {
  url: string;
  className?: string;
}

// A single quiet row holding the composed manifest URL and a copy button (replaces the old
// full-width copy block). The URL is truncated; copy puts the full value on the clipboard.
export function ManifestRow({ url, className }: ManifestRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex items-center gap-3 h-12 pl-4 pr-2 rounded-[11px] bg-base-100 border border-base-content/10 ${
        className ?? ''
      }`}
    >
      <span className="flex-1 min-w-0 truncate font-mono text-xs text-base-content/45">
        {url}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-1.5 shrink-0 h-[34px] px-3.5 rounded-lg bg-base-content/10 text-xs font-semibold text-base-content/80 hover:bg-base-content/20 transition-colors"
      >
        {copied && <Check className="w-3.5 h-3.5" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

export default ManifestRow;
