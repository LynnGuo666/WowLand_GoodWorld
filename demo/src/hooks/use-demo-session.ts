import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getSession } from '@/data'
import type { DocFile, Session } from '@/data'

export interface DemoMsg {
  role: 'user' | 'assistant'
  text: string
  turn: number
}

export type DemoPhase = 'compose' | 'thinking' | 'streaming' | 'done'

export interface DemoSessionApi {
  session: Session
  /** 已发送的消息（含正在流式的助手消息） */
  msgs: DemoMsg[]
  phase: DemoPhase
  /** 正在流式的助手消息的 turn 下标 */
  turnIdx: number
  /** 已流出的字符数 */
  streamed: number
  draft: string
  setDraft: (v: string) => void
  /** 发送当前 draft */
  send: (raw?: string) => void
  /** 跳过流式动画，直接显示全文 */
  skip: () => void
  /** 从一开始重播 */
  restart: () => void
  busy: boolean
  finished: boolean
  streaming: boolean
  /** 已经产出的文档：fileId → 该文档定义 */
  docs: Map<string, DocFile>
  /** 文档内容：fileId → markdown 全文 */
  docContents: Map<string, string>
  /** 最近产出的一份文件 id */
  latestFile: string | null
  /** 用户手动钉住的文件 id（可为 null） */
  pinned: string | null
  setPinned: (id: string | null) => void
  /** 实际要展示的文件 id */
  activeFile: string | null
  /** 当前进度步数 1–7 */
  curStep: number
  /** 流式中已经流出的那半截文本（非流式时为空串） */
  streamText: string
}

/** 思考态的固定停顿，和真实运行时的呼吸感对齐 */
const THINKING_MS = 620

/**
 * 演示会话的状态机：负责轮次推进、逐字流式、文档汇总。
 * 切换 sessionId 时整体重置，调用方不需要手动清状态。
 */
export function useDemoSession(sessionId: string): DemoSessionApi {
  const session = useMemo(() => getSession(sessionId), [sessionId])

  const [msgs, setMsgs] = useState<DemoMsg[]>([])
  const [turnIdx, setTurnIdx] = useState(0)
  /**
   * 阶段带上会话 id：切换会话的那一帧，旧阶段立刻失效，
   * 不会出现「旧 effect 拿新会话的 turns 开跑」这种错位。
   */
  const [phaseState, setPhaseState] = useState<{ sid: string; value: DemoPhase }>({
    sid: session.id,
    value: 'compose',
  })
  const [streamed, setStreamed] = useState(0)
  const [draft, setDraft] = useState(session.turns[0]?.user ?? '')
  const [pinned, setPinned] = useState<string | null>(null)

  const phase: DemoPhase = phaseState.sid === session.id ? phaseState.value : 'compose'
  const setPhase = useCallback(
    (value: DemoPhase) => setPhaseState({ sid: session.id, value }),
    [session.id],
  )

  /** 跳过动画的标记，只在 ref 里，避免重渲染 */
  const skipRef = useRef(false)
  /** thinking 阶段的计时器，卸载或重置时要清掉 */
  const thinkTimer = useRef<number | null>(null)

  const total = session.turns.length
  const streaming = phase === 'streaming'
  const busy = phase === 'thinking' || phase === 'streaming'
  const finished = phase === 'done'

  const clearThinkTimer = useCallback(() => {
    if (thinkTimer.current !== null) {
      window.clearTimeout(thinkTimer.current)
      thinkTimer.current = null
    }
  }, [])

  /* ---------- 切换会话：整体重置 ---------- */
  useEffect(() => {
    clearThinkTimer()
    skipRef.current = false
    setTurnIdx(0)
    setStreamed(0)
    setPinned(null)

    if (session.readOnly) {
      // 只读会话（编辑器指引）：整段一次性铺开，不逐步推进
      setMsgs(
        session.turns.flatMap((t, i) => [
          { role: 'user' as const, text: t.user, turn: i },
          { role: 'assistant' as const, text: t.assistant, turn: i },
        ]),
      )
      setDraft('')
      setPhaseState({ sid: session.id, value: 'done' })
      return
    }

    setMsgs([])
    setPhaseState({ sid: session.id, value: 'compose' })
    setDraft(session.turns[0]?.user ?? '')
  }, [session, clearThinkTimer])

  /* ---------- 发送 ---------- */
  const send = useCallback(
    (raw?: string) => {
      if (busy || finished) return
      const text = (raw ?? draft).trim()
      if (!text) return
      const turn = turnIdx
      setMsgs((m) => [...m, { role: 'user', text, turn }])
      setDraft('')
      setStreamed(0)
      skipRef.current = false
      setPhase('thinking')
      clearThinkTimer()
      thinkTimer.current = window.setTimeout(() => {
        thinkTimer.current = null
        setPhase('streaming')
      }, THINKING_MS)
    },
    [busy, finished, draft, turnIdx, clearThinkTimer, setPhase],
  )

  /* ---------- 跳过动画 ---------- */
  const skip = useCallback(() => {
    skipRef.current = true
  }, [])

  /* ---------- 逐字流式 ---------- */
  useEffect(() => {
    if (phase !== 'streaming') return
    const turn = session.turns[turnIdx]
    if (!turn) return

    const full = turn.assistant
    // 速度跟长度走：短回复不至于一闪而过，长回复不至于等太久
    const cps = Math.min(560, Math.max(210, full.length / 2.6))
    let raf = 0
    let cancelled = false
    let last = performance.now()
    let n = 0

    const tick = (now: number) => {
      if (cancelled) return
      const dt = now - last
      last = now
      n = skipRef.current ? full.length : Math.min(full.length, n + (dt / 1000) * cps)
      setStreamed(Math.floor(n))

      if (n < full.length) {
        raf = requestAnimationFrame(tick)
        return
      }

      // 流完：整段落进消息列表，推进到下一轮
      setMsgs((m) => [...m, { role: 'assistant', text: full, turn: turnIdx }])
      const next = turnIdx + 1
      if (next < total) {
        setTurnIdx(next)
        setDraft(session.turns[next]?.user ?? '')
        setStreamed(0)
        skipRef.current = false
        setPhase('compose')
      } else {
        setPhase('done')
      }
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [phase, turnIdx, total, session, setPhase])

  /* ---------- 重播 ---------- */
  const restart = useCallback(() => {
    clearThinkTimer()
    skipRef.current = false
    setMsgs([])
    setTurnIdx(0)
    setPhase('compose')
    setStreamed(0)
    setPinned(null)
    setDraft(session.turns[0]?.user ?? '')
  }, [session, clearThinkTimer, setPhase])

  /* ---------- 卸载时清计时器 ---------- */
  useEffect(() => clearThinkTimer, [clearThinkTimer])

  /* ---------- 从已发送的助手消息推算文档 ---------- */
  const { docs, docContents } = useMemo(() => {
    const contents = new Map<string, string>()
    for (const m of msgs) {
      if (m.role !== 'assistant') continue
      const d = session.turns[m.turn]?.doc
      if (d) contents.set(d.file, d.content)
    }
    const defs = new Map<string, DocFile>()
    for (const f of session.files) {
      if (contents.has(f.id)) defs.set(f.id, f)
    }
    return { docs: defs, docContents: contents }
  }, [msgs, session])

  const latestFile = useMemo(() => {
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i]
      if (m.role !== 'assistant') continue
      const d = session.turns[m.turn]?.doc
      if (d) return d.file
    }
    return null
  }, [msgs, session])

  const activeFile = pinned && docs.has(pinned) ? pinned : latestFile

  const curTurn = msgs.length ? msgs[msgs.length - 1].turn : 0
  const curStep = session.turns[curTurn]?.step ?? 1

  const streamText = streaming ? (session.turns[turnIdx]?.assistant ?? '').slice(0, streamed) : ''

  return {
    session,
    msgs,
    phase,
    turnIdx,
    streamed,
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
    latestFile,
    pinned,
    setPinned,
    activeFile,
    curStep,
    // 供调用方直接渲染流式中的半截文本
    streamText,
  }
}
