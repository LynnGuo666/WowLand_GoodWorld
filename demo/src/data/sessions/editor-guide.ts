import type { Session, Turn } from '../types'
import { STEP_NAMES } from '../steps'

/**
 * 「编辑器指引」是一个只读会话。
 * 它不属于七步推进的流程，而是把「在编辑器里怎么把世界搭出来」这一段整理成
 * 一组可翻阅的问答，用来给看演示的人指路。
 * 内容全部来自巅峰跑团项目里的 05-build-plan.md 与平台官方文档。
 */

const FILES = [
  { id: 'start', name: 'editor-00.md', label: '从零开工' },
  { id: 'track', name: 'editor-01.md', label: '赛道怎么摆' },
  { id: 'checkpoint', name: 'editor-02.md', label: '检查点 & 落水' },
  { id: 'traps', name: 'editor-03.md', label: '机关怎么做' },
  { id: 'ui', name: 'editor-04.md', label: '名次 & 小地图' },
  { id: 'ship', name: 'editor-05.md', label: '预览与发布' },
]

const start = `# 从零开工

> 一段话版本：**先白模跑通，再换皮**。任何一天结束时都必须能跑一遍。

## 先认四个地方

| 在哪 | 干什么 |
|-|-|
| 中间 3D 视口 | 摆东西 |
| 左上「层级」 | 物体列表，上方 \`当前/4000\` 是容量读数 |
| 左下「资产库」 | 官方模型/材质/UI/组件，拖进场景 |
| 右侧「属性」 | 加组件的入口 |

快捷键：\`Q\` 查看 · \`W\` 平移 · \`E\` 旋转 · \`R\` 缩放 · \`F\` 聚焦 · \`Cmd+D\` 复制 · \`Cmd+Z\` 撤销。

## 第一步：出生点

1. 新建空白项目 → \`Cmd+S\` 保存
2. 新建空物体，改名 \`WorldRoot\`
3. \`Add Component\` → 搜 **Douyin World Root**
   - ⚠️ 每个场景**只能有 1 个**
   - 这个物体的位置**就是玩家出生点**
4. 参数这样设：

| 参数 | 值 | 为什么 |
|-|-|-|
| 移动速度 | 4.5 | 默认 3 太慢，3 分钟跑不完 |
| 跳跃高度 | 1.2 | 果冻台阶要跳得上 |
| 横竖屏 | 只竖屏 | 竖屏才能一只手玩 |
| 重生高度 | -6 | 兜底，漏判落水时平台救一次 |
| 出生顺序 | 随机 | 10 人挤一起才热闹 |

5. 在下面放个 \`Cube\`，缩放 \`(9, 0.5, 6)\` 当起跑台 → 本地运行，能走能跳就对了。

## 范围阶梯

| 级别 | 内容 | 完成定义 |
|-|-|-|
| L0 灰盒 | 出生台 + 4 段赛道 + 3 检查点 | 一个人能跑到终点，2–4 分钟 |
| L1 可玩 | 2 个机关 + 落水回检查点 + 名次条 | 8 人同房能跑完 |
| L2 完整 | 5 个机关 + 关门 + 小地图 | 3 分钟一局 |
| L3 发布 | 首屏、封面、审核、测试员 | 审核通过 |

**超时就按这个顺序砍**：小地图 → 名次卡 → 关门 → 第 5 个机关 → 第 4 段赛道。
**绝不能砍**：完整连通、落水回检查点、名次显示。
`

const track = `# 赛道怎么摆

## 别用 AI 地图生成

AI 地形高度不可控，你摆不出精确的 **0.8 米台阶**和 **1.6 米窄口**。
赛道全部用手摆的几何体，AI 只做远景云海。

## 七块灰盒

| 块 | 缩放 (x, y, z) | 作用 |
|-|-|-|
| 起跑云台 | 9 × 0.5 × 6 | 10 人挤得下 |
| S1 摆锤桥 | 3 × 0.4 × 40 | 3 米宽独木桥 |
| S2 滚筒区 | 7 × 0.4 × 30 | 变宽放滚筒 |
| S3 台阶 | 5 × 0.4 × 22 | 上面叠 5 级 |
| S3 窄口 | **1.6** × 0.4 × 6 | 只过一人 |
| S4 关门道 | 6 × 0.4 × 40 | 直道，两侧会塌 |
| 终点云 | 12 × 0.5 × 9 | 冲线区 |

## 三条硬规矩

1. 每块都要加 \`Box Collider\`
2. **Layer 设成 \`Default(0)\`** —— 平台只允许 0/3/7/9/10/18 层和角色碰撞
3. 每段之间留 **0.5–1 米缝**，缝就是「掉下去」的地方

> 验收：从起点跑到终点，全程不卡。这一段花 2 天是正常的。

## 为什么窄口是 1.6 米

这是全场碰撞最集中的地方。放到 1 米，10 个人会互相顶飞、穿模、卡死；
1.6 米刚好能过两个人，挤但不堵。**这里是全场最容易被拍下来的画面**，
也是 Fall Guys 那套「choke point 节奏」的落点。
`

const checkpoint = `# 检查点 & 落水

## 检查点（30 分钟，最重要）

蛋仔官方就是这么做的：放触发器，跌落回上一个存档点。

1. 三个检查点位置各建空物体 \`CP1/CP2/CP3\`
2. 加 \`Sphere Collider\` → **勾 Is Trigger** → Radius \`3\`
3. 加 **Douyin Script** → \`Assets\` 右键 \`Create → Douyin → Lua script\`
4. 把脚本拖进 Douyin Script 的「脚本文件」槽

\`\`\`lua
-- Checkpoint.lua（挂在 CP1/CP2/CP3，各改 CP_INDEX）
local CP_INDEX = 1

function OnTriggerEnter(c)
    local p = DouyinPlayerService.GetLocalPlayer()
    if not p then return end
    local actor = p:GetActor()
    if not actor then return end
    local d = (actor.gameObject.transform.position
               - self.gameObject.transform.position).magnitude
    if d < 4 then _G.LAST_CHECKPOINT = CP_INDEX end
end
\`\`\`

## 落水判定

挂在 WorldRoot 上，**每 0.2 秒查一次高度**：

\`\`\`lua
local CP = { [0]=Vector3.New(0,1,0), [1]=Vector3.New(0,1,45),
             [2]=Vector3.New(0,1,75), [3]=Vector3.New(0,3,118) }
local t = 0

function Update(dt)
    t = t + dt
    if t < 0.2 then return end
    t = 0
    local p = DouyinPlayerService.GetLocalPlayer()
    local actor = p and p:GetActor()
    if not actor then return end
    if actor.gameObject.transform.position.y < -4 then
        actor:Teleport(CP[_G.LAST_CHECKPOINT or 0], Quaternion.Euler(0,0,0))
    end
end
\`\`\`

## 两个判断

**为什么用高度判定不用碰撞体**：12 人一起掉，碰撞体判定会漏；高度判定便宜又不会漏。

**为什么检查点只记本机**：名次由房主算，检查点是每个人的私事，省一半网络。
`

const traps = `# 机关怎么做

## 核心原则

**机关不做物理，只做「视觉旋转 + 距离判定」。**

12 个人撞一个会转的刚体，物理会抖、会穿模、手机直接掉帧。
摆锤只是「看起来在转」，判定是「你离锤头太近 → 落水」。

## 摆锤

1. 建空物体 \`Trap1_Root\`，下面放 \`Cylinder\` 当锤头（直径 1.2，离地 1 米，正好扫腰）
2. \`Trap1_Root\` 挂 \`Spinner.lua\`：

\`\`\`lua
local AMPLITUDE, PERIOD, PHASE = 55, 2.5, 0
local HIT_R = 1.4
local t, cd = 0, 0

function Update(dt)
    t = t + dt
    self.gameObject.transform.localRotation =
        Quaternion.Euler(0, 0, math.sin(t/PERIOD*math.pi*2 + PHASE) * AMPLITUDE)

    cd = cd - dt
    if cd > 0 then return end
    local p = DouyinPlayerService.GetLocalPlayer()
    local actor = p and p:GetActor()
    if not actor then return end
    local dist = (actor.gameObject.transform.position
                  - self.gameObject.transform.position).magnitude
    if dist < HIT_R + 1.6 then          -- 1.6 = 角色半径
        cd = 1.5
        _G.NEED_RESPAWN = true
    end
end
\`\`\`

3. 复制两次，\`PHASE\` 改 \`2.1\` / \`4.2\` —— 三根交替，玩家只能找缝隙。

## 另外三个

| 机关 | 做法 | 别做 |
|-|-|-|
| 滚筒 | 同一个脚本，轴换 X、\`AMPLITUDE=360\` | 别做刚体推人，用「滚筒之间的缝」制造危险 |
| 果冻台阶 | 台阶上放 Is Trigger 薄片，踩到 \`actor:Jump()\` | 别做弹簧物理，一行代码就够 |
| 窄口 | 1.6 米宽 + 两侧透明挡板 | 别做 1 米，10 个人会互相顶飞 |

## 收敛机制（抄蛋仔）

房主发现你是第 1 名时，把你附近的滚筒周期改小 20%。
不减速、不弹窗，只是「变难一点」。
`

const ui = `# 名次 & 小地图

## 架构一句话

**房主算，大家看。** 别让 10 个客户端各自算名次，会打架。

1. \`RaceManager\` 空物体 → 加 \`Douyin Script\` + \`Douyin Object Sync\`
2. 同步变量只放三个：

\`\`\`lua
---@varSync phase:int
---@varSync elapsed:int
---@varSync progressMap:Dictionary<int,int>
---@end
\`\`\`

3. **只有 \`self:HasOwnership()\` 的那台写**，1 秒写一次
4. 进度算法：\`(玩家z - 起点z) / (终点z - 起点z) × 1000\`

> 如果 \`Dictionary\` 写起来绕，V1 直接用降级方案：
> 只同步 \`phase\` 和 \`elapsed\`，每个客户端本地排序 12 个人算名次。
> 代码少一半，性能没差别。

## UI 三个硬限制（平台规定）

- 主按钮 ≤ **5** 个，图标 ≤ **40×40**，标题 ≤ **4 字**
- 自定义 UI 的 Sort Order 要在 **1–999**
- 不能盖住官方摇杆/跳跃区、小火人区

## 小地图

右上角 200×200 一张贴图（4 个云朵节点 + 虚线航迹）+ 10 个圆点，
圆点位置按 \`progress/1000\` 在折线上插值。
自己是白描边，第 1 名金色放大 1.2 倍。

⚠️ **不要用 RenderTexture 实时渲染**，竖屏那点面积不值这个性能。

## 关门 + 拉一把

1. \`elapsed\` 到 160 秒 → \`phase = 2\`
2. S4 两侧云朵每 5 秒 \`SetActive(false)\` 一组，同时启用阻挡体
3. 被关门外：\`progress < 门对应值\` → \`Teleport\` 到观战台

**「拉一把」建议保留**，代码不到 30 行：门内玩家点一次按钮，
把门外最近的 1 人拽进来，自己 \`SetSpeed(0.6)\` 持续 1.5 秒。
它把「被关门」从「骂一句退出」变成「有人欠你一次」。
`

const ship = `# 预览与发布

## 预览三档

| 步骤 | 做 | 看什么 |
|-|-|-|
| 本地运行 | 右上「本地运行」 | 出生点、落脚、机关时序 |
| 手机预览 | 右上「手机预览」→ 扫码 | 竖屏 UI 有没有压住摇杆、真机帧率 |
| 多人测试 | 创作后台 → 版本管理 → 管理测试员（≤25 人） | 8 人同房会不会互相顶飞 |

## 发布前检查

- 窗口 → 容量占用详情：容量 < 4000、面数 < 130 万
- 出生点不悬空、不卡墙
- 无穿模、无 Z-Fighting
- 手机预览 ≥ 30 FPS

## 上传

1. 右上「上传」，打包约 30 分钟
2. 名称 4–20 字、描述 10–60 字
3. 封面三尺寸：1125×630 / 1800×1800 / 338×338
4. 人数容量设 **12**
5. 提交审核，1–3 个工作日

**审核最容易驳回的三件事**：① 出生点悬空/卡墙 ② 模型穿模 ③ 封面/名称和内容不符。

## 三个一定会踩的坑

1. **玩家出生就掉** → 云台顶面要在 \`y=0\`，WorldRoot 在 \`y=0.6\`
2. **玩家穿过赛道** → Layer 不是 0/3/7/9/10/18，碰撞体没加
3. **Lua 不执行** → 没加 Douyin Script，或脚本没拖进「脚本文件」槽（最高频错误）
`

const TURNS: Turn[] = [
  {
    user: '我想自己把这个世界搭出来，从哪儿开始？',
    step: 1,
    doc: { file: 'start', content: start },
    assistant: `先别急着想美术。**这个世界的 90% 工作量在「一条能跑通的赛道 + 5 个机关 + 1 套名次」**，所以顺序是：先白模跑通，再换皮。

第一天你只需要认四个地方：中间 3D 视口、左上「层级」、左下「资产库」、右侧「属性」。层级上方那个 \`当前/4000\` 是容量读数，不是装饰——发布和流畅度都受它管。

第一件事是放 **Douyin World Root**，一个场景只能有 1 个，它的位置就是玩家出生点。移动速度改 **4.5**（默认 3 太慢，3 分钟跑不完），跳跃高度 **1.2**，重生高度 **-6** 当兜底。

右边我把「从零开工」这一节摆好了，含 L0–L3 的范围阶梯。**超时就按那个顺序砍**，别一口气全做。`,
  },
  {
    user: '赛道可以直接用 AI 生成地图吗？',
    step: 2,
    doc: { file: 'track', content: track },
    assistant: `不建议，而且这不是保守，是**做不到**。

AI 地形的高度不可控，你摆不出精确的 **0.8 米台阶**和 **1.6 米窄口**。这两个尺寸不是随便定的：台阶高度决定手机摇杆能不能走上去，窄口宽度决定 10 个人会不会互相顶飞。

所以赛道全部用手摆的几何体——七块 Cube 就够了。AI 只拿去做远景云海，甚至那块也可以用一块平面加粉色半透明材质糊过去，效果差 20%，成本差 100 倍。

三条硬规矩写在右边：每块加 \`Box Collider\`、**Layer 设成 Default(0)**（平台只允许 0/3/7/9/10/18 层和角色碰撞）、段与段之间留 **0.5–1 米缝**。缝就是掉下去的地方。`,
  },
  {
    user: '掉下去之后怎么回到检查点？',
    step: 3,
    doc: { file: 'checkpoint', content: checkpoint },
    assistant: `分两件事：**检查点记在哪儿**，和**怎么判断你掉下去了**。

检查点用触发器（\`Sphere Collider\` 勾 Is Trigger，半径 3），玩家走过就把 \`_G.LAST_CHECKPOINT\` 记在本机。**只记本机**——名次由房主算，检查点是每个人的私事，这样省一半网络。

落水判定别用碰撞体，用**高度判定**，每 0.2 秒查一次 \`position.y < -4\`。原因很实在：12 个人一起掉的时候，碰撞体判定会漏，高度判定又便宜又不会漏。

然后 \`actor:Teleport(CP[last], ...)\` 送回上一个点。完整代码在右边，两段都能直接粘。

⚠️ 有个high频错误：脚本必须先加 **Douyin Script** 组件，再把 Lua 文件拖进「脚本文件」槽。漏了这一步，代码写得再对也不执行。`,
  },
  {
    user: '机关怎么做出「会动」的感觉？',
    step: 4,
    doc: { file: 'traps', content: traps },
    assistant: `**机关不做物理，只做「视觉旋转 + 距离判定」。** 这句话能省你三天。

12 个人撞一个会转的刚体，物理会抖、会穿模、手机直接掉帧。所以摆锤只是「看起来在转」，真正的判定是「你离锤头中心小于 1.4 米 + 角色半径 1.6 米 → 落水」。玩家感受到的是被扫下去，成本是一个三角函数。

三根摆锤用 \`PHASE\` 错开（0 / 2.1 / 4.2），交替扫过来，玩家只能找缝隙。滚筒是同一个脚本，轴换 X 轴、\`AMPLITUDE\` 改 360。

果冻台阶更省：放一块 Is Trigger 薄片，踩到就 \`actor:Jump()\`。**别做弹簧物理**，一行代码就够。

右边还写了收敛机制——房主发现你是第 1 名就把你附近的滚筒周期改小 20%。不减速不弹窗，只是变难一点。`,
  },
  {
    user: '名次和小地图该怎么做？',
    step: 5,
    doc: { file: 'ui', content: ui },
    assistant: `架构一句话：**房主算，大家看。** 别让 10 个客户端各自算名次，会打架。

\`RaceManager\` 上挂 \`Douyin Script\` + \`Douyin Object Sync\`，同步变量只放三个：\`phase\`、\`elapsed\`、\`progressMap\`。只有 \`HasOwnership()\` 的那台写，1 秒写一次就够（平台同步变量 70–120ms，1Hz 完全够）。

进度算法就是 \`(玩家z - 起点z) / (终点z - 起点z) × 1000\`。**如果 Dictionary 写起来绕，直接降级**：只同步 \`phase\` 和 \`elapsed\`，每个客户端本地排序 12 个人。代码少一半，性能没差别。

UI 有三个平台硬限制写在右边：主按钮 ≤ 5 个、图标 ≤ 40×40、标题 ≤ 4 字、Sort Order 要在 1–999。小地图用 **200×200 贴图 + 光点**，别用 RenderTexture 实时渲染。`,
  },
  {
    user: '最后怎么测、怎么发布？',
    step: 6,
    doc: { file: 'ship', content: ship },
    assistant: `三档测法，从便宜到贵：本地运行看机关时序，手机预览看竖屏 UI 有没有压住摇杆，多人测试（创作后台，最多 25 人）看 8 人同房会不会互相顶飞。

**发布前一定自己跑两遍。** 审核最容易驳回的就三件事：出生点悬空或卡墙、模型穿模、封面/名称跟内容不符。装得再好看，出生点悬空一样打回。

上传打包约 30 分钟；名称 4–20 字、描述 10–60 字、封面三个尺寸、人数容量设 **12**，然后等 1–3 个工作日。

右边最后那段是三个一定会踩的坑，尤其第三条：**Lua 不执行，九成是没加 Douyin Script 组件或者脚本没拖进槽**。`,
  },
]

const THINK: { seconds: number; text: string }[] = [
  { seconds: 4, text: '他要自己动手了。先定顺序：白模跑通再换皮。给他的第一个动作必须是 World Root，而不是「先想美术」。' },
  { seconds: 5, text: 'AI 生成地图在赛道上是错的，不是保守。要说清原因：高度不可控，做不出 0.8 米台阶和 1.6 米窄口。' },
  { seconds: 5, text: '检查点和落水判定要拆成两件事讲，否则会混。重点强调高度判定优于碰撞体，这是 12 人同屏的经验。' },
  { seconds: 6, text: '机关的关键判断是「不做物理」。这能省三天工作量，也是最反直觉的一条，值得放前面。' },
  { seconds: 6, text: '名次架构要说死「房主算大家看」，并给出 Dictionary 的降级方案，避免他卡在同步变量上。' },
  { seconds: 4, text: '发布这一段最实用的是驳回原因，不是流程。先把三个高频驳回讲清楚。' },
]

export const EDITOR_GUIDE: Session = {
  id: 'editor-guide',
  title: '编辑器指引',
  subtitle: '怎么把它真的搭出来',
  group: 'guide',
  steps: STEP_NAMES,
  files: FILES,
  turns: TURNS,
  think: THINK,
  readOnly: true,
}
