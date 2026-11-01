/** 一份产出的文档定义 */
export interface DocFile {
  /** 文档 id，同一会话内唯一，如 'brief' */
  id: string
  /** 文件名，显示用，如 '00-brief.md' */
  name: string
  /** 中文名，显示用，如 '想法底稿' */
  label: string
}

/** 一轮对话 */
export interface Turn {
  user: string
  assistant: string
  /** 当前进行到第几步，1–7 */
  step: number
  /** 被跳过的步骤编号 */
  skipped?: number[]
  /** 这一轮产出的文档（同 id 后写覆盖先写） */
  doc?: { file: string; content: string }
}

/** 一个完整的演示会话 */
export interface Session {
  id: string
  /** 会话标题，如 '蛊真人 · 换记忆' */
  title: string
  /** 副标题，如 '反派重生 · 以命换力' */
  subtitle: string
  /** 侧边栏分组：真实跑通的记录 / 编辑器指引 */
  group: 'run' | 'guide'
  /** 七步进度条文案 */
  steps: string[]
  /** 这个会话会产出的文件清单，顺序即展示顺序 */
  files: DocFile[]
  turns: Turn[]
  /** 每轮的思考摘要，下标与 turns 对齐，可缺省 */
  think?: { seconds: number; text: string }[]
  /** 指引类会话：只能看，不能一步步推进 */
  readOnly?: boolean
}

/** 侧边栏分组定义，顺序即展示顺序 */
export interface SessionGroup {
  id: 'run' | 'guide'
  title: string
  /** 分组说明，一句话 */
  hint: string
}
