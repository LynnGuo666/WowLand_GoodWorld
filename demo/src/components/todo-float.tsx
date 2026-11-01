import { CheckIcon, SkipForwardIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Progress } from '@/components/ui/progress'
import { ChevronUpIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 悬浮在输入框上方的待办清单。
 * 收起时只有一行（当前步 + 进度），展开时是七步清单。
 */
export function TodoFloat({
  steps,
  step,
  skipped = [],
  defaultOpen = true,
  className,
}: {
  steps: string[]
  /** 1-based，当前进行到第几步 */
  step: number
  skipped?: number[]
  defaultOpen?: boolean
  className?: string
}) {
  const total = steps.length
  const doneCount = steps.filter((_, i) => i + 1 < step).length
  const curName = steps[Math.min(step, total) - 1] ?? steps[total - 1]
  const percent = Math.round((doneCount / total) * 100)

  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className={cn('absolute inset-x-0 bottom-full mb-2', className)}
    >
      <div className="overflow-hidden rounded-2xl border border-[#ececec] bg-white/92 shadow-[0_8px_28px_-8px_rgba(0,0,0,0.14),0_2px_6px_-2px_rgba(0,0,0,0.06)] backdrop-blur-md">
        <CollapsibleTrigger className="group flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-[#fafafa]">
          <Badge
            variant="secondary"
            className="size-5 shrink-0 justify-center rounded-md bg-brand-soft p-0 font-mono text-[10.5px] font-semibold text-brand"
          >
            {Math.min(step, total)}
          </Badge>

          <span className="min-w-0 flex-1">
            <span className="flex items-baseline gap-1.5">
              <span className="text-[10px] tracking-[0.06em] text-[#b0b0b0]">进行中</span>
              <span className="truncate text-[12.5px] font-medium text-ink">{curName}</span>
            </span>
          </span>

          <span className="shrink-0 font-mono text-[10.5px] tabular-nums text-[#b8b8b8]">
            {doneCount}
            <span className="text-[#dcdcdc]"> / {total}</span>
          </span>

          <ChevronUpIcon
            className="size-3.5 shrink-0 text-[#c0c0c0] transition-transform duration-200 group-data-[panel-open]:rotate-180"
            strokeWidth={2.2}
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <ol className="px-3">
            {steps.map((name, i) => {
              const n = i + 1
              const isSkipped = skipped.includes(n)
              const isDone = n < step
              const isCurrent = n === step

              return (
                <li key={name} className="relative flex items-center gap-2.5 py-[3.5px]">
                  {i < total - 1 && (
                    <span
                      className={cn(
                        'absolute left-[7px] top-[17px] h-[calc(100%-6px)] w-px',
                        isDone ? 'bg-[#e0dcfa]' : 'bg-[#f0f0f0]',
                      )}
                    />
                  )}

                  <span className="relative z-10 grid size-[15px] shrink-0 place-items-center">
                    {isDone && (
                      <span className="grid size-[15px] place-items-center rounded-full bg-brand">
                        <CheckIcon className="size-[9px] text-white" strokeWidth={3.2} />
                      </span>
                    )}
                    {isCurrent && (
                      <span className="grid size-[15px] place-items-center rounded-full border-[1.5px] border-brand bg-white">
                        <span className="size-[5px] rounded-full bg-brand" />
                      </span>
                    )}
                    {isSkipped && (
                      <span className="grid size-[15px] place-items-center rounded-full bg-[#f5f5f5]">
                        <SkipForwardIcon className="size-[7px] text-[#c0c0c0]" strokeWidth={3} />
                      </span>
                    )}
                    {!isDone && !isCurrent && !isSkipped && (
                      <span className="size-[15px] rounded-full border-[1.5px] border-[#e6e6e6] bg-white" />
                    )}
                  </span>

                  <span
                    className={cn(
                      'min-w-0 flex-1 truncate text-[12px] leading-[1.4]',
                      isSkipped && 'text-[#c8c8c8] line-through decoration-[#e0e0e0]',
                      isDone && 'text-[#9a9a9a]',
                      isCurrent && 'font-medium text-ink',
                      !isDone && !isCurrent && !isSkipped && 'text-[#c0c0c0]',
                    )}
                  >
                    {name}
                  </span>

                  <span
                    className={cn(
                      'shrink-0 font-mono text-[10px] leading-[1.6]',
                      isCurrent ? 'text-brand' : 'text-transparent',
                    )}
                  >
                    {isCurrent ? '现在' : '·'}
                  </span>
                </li>
              )
            })}
          </ol>
          <div className="px-3 pb-2.5 pt-1.5">
            <Progress value={percent} className="gap-0">
              <span className="sr-only">进度</span>
            </Progress>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
