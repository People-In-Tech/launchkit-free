'use client';

import { usePresence } from '@/hooks/use-presence';
import { cn } from '@/lib/utils';

interface PresenceIndicatorProps {
  channel: string;
  maxAvatars?: number;
  className?: string;
}

/**
 * Shows a green dot / avatar stack of users currently online in a channel.
 */
export function PresenceIndicator({
  channel,
  maxAvatars = 5,
  className,
}: PresenceIndicatorProps) {
  const { members, count } = usePresence(channel);
  const visibleMembers = members.slice(0, maxAvatars);
  const overflow = count - maxAvatars;

  if (count === 0) return null;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex -space-x-2">
        {visibleMembers.map((member) => (
          <div
            key={member.userId}
            className="relative h-8 w-8 rounded-full border-2 border-background"
            title={member.userInfo.name}
          >
            {member.userInfo.avatar ? (
              <img
                src={member.userInfo.avatar}
                alt={member.userInfo.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {member.userInfo.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500" />
          </div>
        ))}
        {overflow > 0 && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
            +{overflow}
          </div>
        )}
      </div>
      <span className="text-xs text-muted-foreground">
        {count} online
      </span>
    </div>
  );
}
