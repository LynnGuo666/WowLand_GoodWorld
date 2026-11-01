import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

/** Agent 头像：黑底白字的「世」 */
export function AgentAvatar({ className }: { className?: string }) {
  return (
    <Avatar className={cn('size-[26px] bg-ink text-white', className)}>
      <AvatarFallback className="bg-ink font-serif text-[14px] font-bold text-white">
        世
      </AvatarFallback>
    </Avatar>
  )
}

/** 用户头像 */
export function UserAvatar({ className }: { className?: string }) {
  return (
    <Avatar className={cn('size-7', className)}>
      <AvatarFallback className="bg-brand-soft text-[11.5px] font-medium text-brand">
        L
      </AvatarFallback>
    </Avatar>
  )
}
