import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowUpIcon,
  BookOpenIcon,
  CheckIcon,
  ChevronDownIcon,
  FileTextIcon,
  MessageSquarePlusIcon,
  MoreHorizontalIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  PencilRulerIcon,
  RotateCcwIcon,
  SearchIcon,
  SettingsIcon,
  ShareIcon,
  SparklesIcon,
} from 'lucide-react'
import { AgentAvatar, UserAvatar } from '@/components/agent-avatar'
import { Markdown } from '@/components/markdown'
import { MessageActions, Thinking } from '@/components/message-actions'
import { TodoFloat } from '@/components/todo-float'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DEFAULT_SESSION_ID,
  SESSION_GROUPS,
  SESSIONS,
  getSession,
  sessionsInGroup,
  type DocFile,
  type Session,
} from '@/data'
import { useDemoSession } from '@/hooks/use-demo-session'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  消息                                                                */
/* ------------------------------------------------------------------ */
function UserMessage({ text }: { text: string }) {
  return (
    <div className="pop flex justify-end">
      <div className="max-w-[84%] whitespace-pre-wrap rounded-[20px] bg-bubble px-[17px] py-[11px] text-[15px] leading-[1.74] text-[#1f1f1f]">
        {text}
      </div>
    </div>
  )
}

function AssistantMessage({
  session,
  turn,
  text,
  streaming = false,
  showThink = true,
}: {
  session: Session
  turn: number
  text: string
  streaming?: boolean
  showThink?: boolean
}) {
  const think = session.think?.[turn]

  return (
    <div className="rise flex gap-3">
      <AgentAvatar />
      <div className="min-w-0 flex-1 pt-[1px]">
        {showThink && think && (
          <Thinking
            text={think.text}
            seconds={think.seconds}
            live={streaming ? '正在想' : undefined}
          />
        )}
        <div className="relative">
          <Markdown>{text}</Markdown>
          {streaming && <span className="caret ml-0.5" />}
        </div>
        {!streaming && <MessageActions />}
      </div>
    </div>
  )
}

function Typing() {
  return (
    <div className="flex items-center gap-3">
      <AgentAvatar />
      <div className="dot-breathe flex items-center gap-[5px] py-1">
        <span className="size-[6px] rounded-full bg-[#b5b5b5]" />
        <span className="size-[6px] rounded-full bg-[#b5b5b5]" />
        <span className="size-[6px] rounded-full bg-[#b5b5b5]" />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  右侧产出面板                                                         */
/* ------------------------------------------------------------------ */
function DocPanel({
  docs,
  contents,
  totalFiles,
  active,
  onPick,
  onClose,
}: {
  docs: Map<string, DocFile>
  contents: Map<string, string>
  totalFiles: number
  active: string | null
  onPick: (id: string) => void
  onClose: () => void
}) {
  const produced = [...docs.values()]
  const activeDoc = active ? docs.get(active) : undefined
  const content = active ? contents.get(active) : undefined

  return (
    <aside className="flex h-full w-[404px] shrink-0 flex-col border-l border-border bg-[#fcfcfc]">
      <div className="flex h-[52px] shrink-0 items-center gap-2 border-b border-border px-4">
        <BookOpenIcon className="size-[15px] text-muted-foreground" strokeWidth={1.9} />
        <span className="text-[13px] font-medium">本次产出</span>
        <span className="rounded-full bg-muted px-[7px] py-[1px] font-mono text-[11px] text-muted-foreground">
          {produced.length} / {totalFiles}
        </span>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                aria-label="收起面板"
                className="ml-auto text-muted-foreground"
              >
                <PanelRightCloseIcon strokeWidth={1.9} />
              </Button>
            }
          />
          <TooltipContent>收起面板</TooltipContent>
        </Tooltip>
      </div>

      <div className="shrink-0 border-b border-border px-3 py-2">
        <div className="flex flex-wrap gap-1">
          {produced.map((f) => {
            const isActive = active === f.id
            return (
              <Button
                key={f.id}
                variant={isActive ? 'default' : 'ghost'}
                size="xs"
                onClick={() => onPick(f.id)}
                className={cn('font-mono', !isActive && 'text-[#5c5c5c]')}
              >
                {f.name}
              </Button>
            )
          })}
          {produced.length === 0 && (
            <span className="px-1 py-1 font-mono text-[11px] text-[#d2d2d2]">还没有文件</span>
          )}
        </div>
      </div>

      <div className="scroll-thin flex-1 overflow-y-auto px-5 py-[18px]">
        {content && activeDoc ? (
          <div key={active} className="pop">
            <div className="mb-4 flex items-baseline gap-2 border-b border-border pb-2.5">
              <h2 className="text-[13px] font-semibold tracking-[0.01em]">{activeDoc.label}</h2>
              <span className="font-mono text-[10.5px] text-muted-foreground">{activeDoc.name}</span>
              <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] text-[#5a9b73]">
                <CheckIcon className="size-2.5" strokeWidth={2.6} />
                已生成
              </span>
            </div>
            <Markdown dense>{content}</Markdown>
          </div>
        ) : (
          <div className="mt-20 flex flex-col items-center text-center">
            <div className="grid size-11 place-items-center rounded-full border border-dashed border-border">
              <FileTextIcon className="size-4 text-[#c8c8c8]" strokeWidth={1.6} />
            </div>
            <p className="mt-3 text-[12.5px] leading-[1.8] text-muted-foreground">
              它每聊完一步，
              <br />
              就往这里落一份文件。
            </p>
          </div>
        )}
      </div>

      {produced.length > 0 && (
        <div className="shrink-0 border-t border-border px-4 py-2.5">
          <p className="font-mono text-[10.5px] leading-relaxed text-[#c4c4c4]">
            worlds/&lt;世界名&gt;/
          </p>
        </div>
      )}
    </aside>
  )
}

/* ------------------------------------------------------------------ */
/*  侧边栏                                                              */
/* ------------------------------------------------------------------ */
function Sidebar({
  sessionId,
  onPick,
}: {
  sessionId: string
  onPick: (id: string) => void
}) {
  return (
    <nav className="flex h-full w-[248px] shrink-0 flex-col border-r border-border bg-[#f9f9f9]">
      <div className="flex h-[52px] items-center px-2.5">
        <Button
          variant="ghost"
          className="h-8 w-full justify-start gap-2 px-2 text-[13.5px] font-medium"
        >
          <AgentAvatar className="size-5" />
          <span className="truncate font-serif font-semibold tracking-[0.01em]">造个好世界</span>
          <ChevronDownIcon className="ml-auto text-muted-foreground" strokeWidth={2} />
        </Button>
      </div>

      <div className="space-y-0.5 px-2">
        <Button
          variant="ghost"
          className="h-9 w-full justify-start gap-2.5 px-2.5 text-[13.5px]"
        >
          <MessageSquarePlusIcon className="text-[#6b6b6b]" strokeWidth={1.9} />
          新世界
        </Button>
        <Button
          variant="ghost"
          className="h-9 w-full justify-start gap-2.5 px-2.5 text-[13.5px]"
        >
          <SearchIcon className="text-[#6b6b6b]" strokeWidth={1.9} />
          搜索
        </Button>
      </div>

      <div className="scroll-thin flex-1 overflow-y-auto px-2 pb-2">
        {SESSION_GROUPS.map((group) => {
          const items = sessionsInGroup(group.id)
          if (items.length === 0) return null
          return (
            <div key={group.id} className="mt-4">
              <div className="flex items-center gap-1.5 px-1.5 pb-1">
                {group.id === 'guide' ? (
                  <PencilRulerIcon className="size-3 text-[#a5a5a5]" strokeWidth={2} />
                ) : null}
                <span className="text-[11.5px] font-medium tracking-[0.05em] text-[#a5a5a5]">
                  {group.title}
                </span>
                <span className="font-mono text-[10.5px] text-[#c8c8c8]">{items.length}</span>
              </div>

              {items.map((s) => {
                const active = s.id === sessionId
                return (
                  <button
                    key={s.id}
                    onClick={() => onPick(s.id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg px-2.5 py-[7px] text-left transition-colors',
                      active ? 'bg-[#ececec]' : 'hover:bg-[#efefef]',
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="block truncate text-[13px] leading-[1.5]">{s.title}</span>
                        {s.readOnly && (
                          <span className="shrink-0 rounded-[4px] bg-[#f0f0f0] px-1 py-[1px] text-[9.5px] leading-[1.4] text-[#9a9a9a]">
                            只读
                          </span>
                        )}
                      </span>
                      <span className="block truncate text-[11px] leading-[1.55] text-[#a8a8a8]">
                        {s.subtitle}
                      </span>
                    </span>
                    {active && <span className="size-1.5 shrink-0 rounded-full bg-brand" />}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>

      <Separator />
      <div className="p-2">
        <Button variant="ghost" className="h-auto w-full justify-start gap-2.5 px-2 py-1.5">
          <UserAvatar />
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-[12.5px] leading-[1.5]">lynn</span>
            <span className="block truncate text-[11px] leading-[1.5] text-[#a8a8a8]">个人版</span>
          </span>
          <SettingsIcon className="shrink-0 text-[#b8b8b8]" strokeWidth={1.9} />
        </Button>
      </div>
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/*  主页面                                                              */
/* ------------------------------------------------------------------ */
export default function App() {
  const [sessionId, setSessionId] = useState(DEFAULT_SESSION_ID)
  const [panelOpen, setPanelOpen] = useState(true)

  const {
    session,
    msgs,
    phase,
    turnIdx,
    draft,
    setDraft,
    send,
    skip,
    restart,
    busy,
    finished,
    streaming,
    docs,
    docContents,
    pinned,
    setPinned,
    activeFile,
    curStep,
    streamText,
  } = useDemoSession(sessionId)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const stickRef = useRef(true)

  const readOnly = !!session.readOnly
  const curTurn = msgs.length ? msgs[msgs.length - 1].turn : 0
  const curSkipped = session.turns[curTurn]?.skipped ?? []

  /* ---------- 键盘 ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (readOnly) return
      const el = e.target as HTMLElement | null
      const inTextarea = el?.tagName === 'TEXTAREA'

      if (e.code === 'Space' && !inTextarea) {
        e.preventDefault()
        if (streaming) skip()
        else if (!busy && !finished) send()
        return
      }
      if (e.key === 'Enter' && !inTextarea) {
        e.preventDefault()
        if (streaming) skip()
        else if (!busy && !finished) send()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, finished, readOnly, send, skip, streaming])

  /* ---------- 自动滚动 ---------- */
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const gap = el.scrollHeight - el.scrollTop - el.clientHeight
      stickRef.current = gap < 80
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const streamChars = session.turns[turnIdx]?.assistant.length ?? 0
  useEffect(() => {
    const el = scrollRef.current
    if (!el || !streaming) return
    if (!stickRef.current) return
    el.scrollTop = el.scrollHeight
    const id = requestAnimationFrame(() => {
      if (stickRef.current) el.scrollTop = el.scrollHeight
    })
    return () => cancelAnimationFrame(id)
  }, [streaming, streamText.length, streamChars])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    if (phase === 'thinking') stickRef.current = true
    if (!stickRef.current) return
    const id = window.setTimeout(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }, 40)
    return () => window.clearTimeout(id)
  }, [msgs, phase])

  /* ---------- 切换会话 ---------- */
  const pickSession = useCallback((id: string) => {
    setSessionId(id)
    setPinned(null)
    stickRef.current = true
  }, [setPinned])

  const activeSession = getSession(sessionId)

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      <Sidebar sessionId={sessionId} onPick={pickSession} />

      <main className="flex min-w-0 flex-1 flex-col">
        {/* 顶栏 */}
        <header className="flex h-[52px] shrink-0 items-center gap-2 border-b border-border px-4">
          <div className="flex items-center gap-1.5">
            <SparklesIcon className="size-[13px] text-brand" strokeWidth={2.1} />
            <span className="text-[13.5px] font-medium">{activeSession.title}</span>
            <span className="font-mono text-[10.5px] text-[#b0b0b0]">v0.3.0</span>
          </div>

          {readOnly && (
            <span className="ml-1 rounded-full bg-[#f5f5f5] px-2 py-[3px] text-[10.5px] text-[#8a8a8a]">
              只读指引
            </span>
          )}

          <div className="ml-auto flex items-center gap-0.5">
            <Button
              variant="outline"
              size="sm"
              className="hidden rounded-full sm:inline-flex"
            >
              <ShareIcon strokeWidth={1.9} />
              分享
            </Button>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button variant="ghost" size="icon-sm" aria-label="更多" className="text-muted-foreground">
                    <MoreHorizontalIcon strokeWidth={1.9} />
                  </Button>
                }
              />
              <TooltipContent>更多</TooltipContent>
            </Tooltip>
            {!panelOpen && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setPanelOpen(true)}
                      aria-label="打开产出面板"
                      className="text-muted-foreground"
                    >
                      <PanelRightOpenIcon strokeWidth={1.9} />
                    </Button>
                  }
                />
                <TooltipContent>打开产出面板</TooltipContent>
              </Tooltip>
            )}
          </div>
        </header>

        {/* 对话流 */}
        <div ref={scrollRef} className="scroll-thin flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[736px] px-6 pb-6 pt-7">
            {msgs.length === 0 && (
              <div className="mb-8">
                <h1 className="font-serif text-[26px] font-semibold tracking-[0.01em]">
                  {activeSession.title}
                </h1>
                <p className="mt-1.5 text-[13.5px] text-muted-foreground">
                  {activeSession.subtitle}
                </p>
              </div>
            )}

            {msgs.map((m, i) =>
              m.role === 'user' ? (
                <div key={i} className="mb-6">
                  <UserMessage text={m.text} />
                </div>
              ) : (
                <div key={i} className="mb-6">
                  <AssistantMessage
                    session={session}
                    turn={m.turn}
                    text={m.text}
                    showThink={!readOnly}
                  />
                </div>
              ),
            )}

            {phase === 'thinking' && (
              <div className="mb-6">
                <Typing />
              </div>
            )}

            {streaming && (
              <div className="mb-6">
                <AssistantMessage session={session} turn={turnIdx} text={streamText} streaming />
              </div>
            )}

            {finished && !readOnly && (
              <div className="mt-12 flex flex-col items-center pb-4">
                <div className="h-7 w-px bg-border" />
                <p className="mt-4 font-serif text-[15px] tracking-[0.03em] text-muted-foreground">
                  七步走完。
                </p>
                <p className="mt-1.5 text-[12.5px] text-[#b4b4b4]">
                  右边是这一次聊出来的全部文件。
                </p>
                <Button variant="outline" size="sm" className="mt-5" onClick={restart}>
                  <RotateCcwIcon strokeWidth={1.9} />
                  从头再看一遍
                </Button>
              </div>
            )}

            {finished && readOnly && (
              <div className="mt-12 flex flex-col items-center pb-4">
                <div className="h-7 w-px bg-border" />
                <p className="mt-4 font-serif text-[15px] tracking-[0.03em] text-muted-foreground">
                  这是索引，不是流程。
                </p>
                <p className="mt-1.5 text-[12.5px] text-[#b4b4b4]">
                  真正跑通的记录在左边「真实跑通的世界」里。
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 输入区 */}
        <div className="shrink-0 bg-background">
          <div className="mx-auto w-full max-w-[736px] px-6 pb-3 pt-2">
            <div className="relative">
              {!readOnly && !finished && msgs.length > 0 && (
                <TodoFloat steps={session.steps} step={curStep} skipped={curSkipped} />
              )}

              <div
                className={cn(
                  'relative rounded-[24px] border bg-background py-[6px] pl-4 pr-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors',
                  readOnly && 'opacity-60',
                  busy ? 'border-[#eee]' : 'border-border focus-within:border-[#d8d8d8]',
                )}
              >
                <div className="flex items-end gap-2">
                  <Textarea
                    ref={inputRef}
                    value={readOnly ? '' : busy ? '' : draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        send()
                      }
                    }}
                    disabled={readOnly || busy || finished}
                    rows={readOnly ? 1 : Math.min(6, Math.max(1, draft.split('\n').length))}
                    placeholder={
                      readOnly
                        ? '只读指引 · 不能继续对话'
                        : finished
                          ? '这一遍演完了'
                          : busy
                            ? '它正在回你…'
                            : '说说你脑子里的那个画面'
                    }
                    className="scroll-thin max-h-[168px] min-h-[38px] flex-1 resize-none border-0 bg-transparent px-0 py-[6px] text-[15px] leading-[1.7] shadow-none focus-visible:ring-0"
                  />
                  <Button
                    size="icon"
                    onClick={() => (streaming ? skip() : send())}
                    disabled={readOnly || (!busy && !finished && !draft.trim())}
                    aria-label={streaming ? '跳过动画' : '发送'}
                    className="mb-[2px] shrink-0 rounded-full"
                  >
                    {streaming ? (
                      <span className="size-[9px] rounded-[2px] bg-white" />
                    ) : (
                      <ArrowUpIcon strokeWidth={2.4} />
                    )}
                  </Button>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-center gap-3 text-[10.5px] tracking-[0.02em] text-[#c4c4c4]">
                {readOnly ? (
                  <span>这是只读指引，用来查在编辑器里怎么操作</span>
                ) : (
                  <>
                    <span>对话来自真实运行记录</span>
                    <span className="text-[#e4e4e4]">·</span>
                    <span>
                      <kbd className="rounded border border-border bg-muted px-1 py-[1px] font-mono text-[10px]">
                        Enter
                      </kbd>{' '}
                      发送
                    </span>
                    <span className="text-[#e4e4e4]">·</span>
                    <span>
                      <kbd className="rounded border border-border bg-muted px-1 py-[1px] font-mono text-[10px]">
                        Space
                      </kbd>{' '}
                      跳过动画
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {panelOpen && (
        <DocPanel
          docs={docs}
          contents={docContents}
          totalFiles={session.files.length}
          active={activeFile}
          onPick={setPinned}
          onClose={() => setPanelOpen(false)}
        />
      )}
    </div>
  )
}
