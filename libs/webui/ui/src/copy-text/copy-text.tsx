import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
type CopyTextProps = {
  text: string;
  icon?: React.ReactNode;
};

export function CopyText({ text, icon }: CopyTextProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="bg-base-200 p-4 rounded-lg flex items-center gap-2">
      {icon}
      <pre className="flex-grow text-ellipsis overflow-hidden whitespace-nowrap ">
        {text}
      </pre>
      <button
        className={`btn btn-sm btn-outline ml-auto transition-all duration-300 ${
          copied ? 'btn-success' : 'btn-outline'
        }`}
        onClick={handleCopy}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className=" w-4 h-4" />}
        {copied ? 'Copied to clipboard' : 'Copy'}
      </button>
    </div>
  );
}

export default CopyText;
