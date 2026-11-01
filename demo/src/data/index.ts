export * from './types'
export * from './steps'
export { HUANJIYI } from './sessions/huanjiyi'
export { DIANFENG } from './sessions/dianfeng'
export { EDITOR_GUIDE } from './sessions/editor-guide'

import type { Session, SessionGroup } from './types'
import { HUANJIYI } from './sessions/huanjiyi'
import { DIANFENG } from './sessions/dianfeng'
import { EDITOR_GUIDE } from './sessions/editor-guide'

/** 侧边栏分组，顺序即展示顺序 */
export const SESSION_GROUPS: SessionGroup[] = [
  { id: 'run', title: '真实跑通的世界', hint: '完整走完七步，右侧能看到落盘的文件' },
  { id: 'guide', title: '编辑器指引', hint: '怎么在编辑器里把它搭出来' },
]

/** 会话注册表，顺序即侧边栏里的顺序 */
export const SESSIONS: Session[] = [HUANJIYI, DIANFENG, EDITOR_GUIDE]

/** 默认会话 id */
export const DEFAULT_SESSION_ID = 'huanjiyi'

/** 按 id 取会话，找不到就回落到第一个 */
export function getSession(id: string): Session {
  return SESSIONS.find((s) => s.id === id) ?? SESSIONS[0]
}

/** 按分组取会话 */
export function sessionsInGroup(group: SessionGroup['id']): Session[] {
  return SESSIONS.filter((s) => s.group === group)
}
