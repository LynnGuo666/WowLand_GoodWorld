import { Check, ChevronRight, Copy, RotateCcw, ThumbsDown, ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

/** 消息下方的操作按钮：复制 / 有帮助 / 没帮助 / 重新生成 */
export function MessageActions() {
  const [copied, setCopied] = useState(false)
  const [vote, setVote] = useState<'up' | 'down' | null>(null)

  const items = [
    {
      key: 'copy',
      label: copied ? '已复制' : '复制',
      icon: copied ? Check : Copy,
      active: copied,
      onClick: () => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1300)
      },
    },
    {
      key: 'up',
      label: '有帮助',
      icon: ThumbsUp,
      active: vote === 'up',
      onClick: () => setVote((v) => (v === 'up' ? null : 'up')),
    },
    {
      key: 'down',
      label: '没帮助',
      icon: ThumbsDown,
      active: vote === 'down',
      onClick: () => setVote((v) => (v === 'down' ? null : 'down')),
    },
    { key: 'retry', label: '重新生成', icon: RotateCcw, active: false, onClick: () => {} },
  ]

  return (
    <div className="mt-1 flex items-center gap-0.5">
      {items.map(({ key, label, icon: Icon, active, onClick }) => (
        <Tooltip key={key}>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onClick}
                aria-label={label}
                className={cn(
                  'text-[#bdbdbd] hover:bg-[#f4f4f4] hover:text-[#6b6b6b]',
                  active && 'bg-[#f0f0f0] text-ink',
                )}
              >
                <Icon strokeWidth={1.9} />
              </Button>
            }
          />
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}

/** 折叠的「思考过程」小条 */
export function Thinking({
  text,
  seconds,
  live,
}: {
  text: string
  seconds: number
  live?: string
}) {
  const [open, setOpen] = useState(false)
  const pending = !!live

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mb-2.5">
      <CollapsibleTrigger
        disabled={pending}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md py-0.5 text-[12.5px] transition-colors',
          pending ? 'cursor-default text-[#8f8f8f]' : 'text-[#8f8f8f] hover:text-[#4b4b4b]',
        )}
      >
        {pending ? (
          <span className="dot-breathe flex items-center gap-[3px]">
            <span className="size-[4px] rounded-full bg-[#b5b5b5]" />
            <span className="size-[4px] rounded-full bg-[#b5b5b5]" />
            <span className="size-[4px] rounded-full bg-[#b5b5b5]" />
          </span>
        ) : (
          <ChevronRight
            className={cn('size-3 transition-transform duration-200', open && 'rotate-90')}
            strokeWidth={2.2}
          />
        )}
        {pending ? '正在想' : `已思考 ${seconds} 秒`}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p className="rise mt-1.5 border-l-2 border-[#efefef] pl-3 text-[12.5px] leading-[1.75] text-[#8a8a8a]">
          {text}
        </p>
      </CollapsibleContent>
    </Collapsible>
  )
}
