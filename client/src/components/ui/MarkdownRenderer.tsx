import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Basic markdown parser
  const renderFormattedText = () => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockLang = '';
    let codeBlockContent: string[] = [];
    let codeBlockIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // Finish code block
          const codeString = codeBlockContent.join('\n');
          const currentIdx = codeBlockIndex++;
          elements.push(
            <div key={`code-${i}`} className="my-6 rounded-xl overflow-hidden border border-white/10 bg-gray-950">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-white/10 text-xs text-gray-400 font-mono">
                <span>{codeBlockLang || 'code'}</span>
                <button
                  onClick={() => copyCode(codeString, currentIdx)}
                  className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                >
                  {copiedIndex === currentIdx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-sm font-mono overflow-x-auto text-gray-200 leading-relaxed">
                <code>{codeString}</code>
              </pre>
            </div>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeBlockLang = line.replace('```', '').trim();
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      // Headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-xl font-bold text-white mt-8 mb-3">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-2xl font-bold text-cyan-300 mt-10 mb-4 border-b border-white/10 pb-2">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-3xl font-extrabold text-white mt-10 mb-6 tracking-tight">
            {line.replace('# ', '')}
          </h1>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={i} className="ml-6 list-disc text-gray-300 my-1 leading-relaxed">
            {line.replace(/^[-*]\s+/, '')}
          </li>
        );
      } else if (line.startsWith('> ')) {
        elements.push(
          <blockquote
            key={i}
            className="my-4 border-l-4 border-cyan-500 pl-4 py-1 italic text-gray-400 bg-cyan-950/20 rounded-r-lg"
          >
            {line.replace('> ', '')}
          </blockquote>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={i} className="h-4" />);
      } else {
        elements.push(
          <p key={i} className="text-gray-300 leading-relaxed text-base my-2">
            {line}
          </p>
        );
      }
    }

    return elements;
  };

  return <div className="prose prose-invert max-w-none">{renderFormattedText()}</div>;
};
