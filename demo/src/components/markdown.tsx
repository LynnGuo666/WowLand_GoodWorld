import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

function CodeBlock({ children }: { children?: React.ReactNode }) {
  const [copied, setCopied] = React.useState(false)
  const raw = React.useMemo(() => {
    const out: string[] = []
    React.Children.forEach(children, (child) => {
      if (React.isValidElement<{ children?: React.ReactNode }>(child)) {
        React.Children.forEach(child.props.children, (c) => {
          if (typeof c === 'string') out.push(c)
        })
      }
    })
    return out.join('')
  }, [children])

  const copy = () => {
    navigator.clipboard?.writeText(raw).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    })
  }

  return (
    <div className="codeblock">
      <div className="cb-head">
        <span>文本 / 可直接复制</span>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] text-[#8b8b8b] transition-colors hover:bg-[#ececee] hover:text-ink"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <pre>{children}</pre>
    </div>
  )
}

export function Markdown({
  children,
  dense = false,
  className,
}: {
  children: string
  dense?: boolean
  className?: string
}) {
  return (
    <div className={cn('md', dense && 'md-doc', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
