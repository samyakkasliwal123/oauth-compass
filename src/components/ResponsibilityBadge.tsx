import React from "react";
import { ResponsibilityState } from "@/types/guide";
import { Bot, UserCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResponsibilityBadgeProps {
  responsibility: ResponsibilityState;
  className?: string;
  showIcon?: boolean;
}

export function ResponsibilityBadge({
  responsibility,
  className,
  showIcon = true,
}: ResponsibilityBadgeProps) {
  if (responsibility === "agent-can-perform") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
          className
        )}
      >
        {showIcon && <Bot className="h-3.5 w-3.5" />}
        Agent can perform
      </span>
    );
  }

  if (responsibility === "agent-assists") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20",
          className
        )}
      >
        {showIcon && <UserCheck className="h-3.5 w-3.5" />}
        Agent assists; developer confirms
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700",
        className
      )}
    >
      {showIcon && <ShieldAlert className="h-3.5 w-3.5 text-slate-400" />}
      Developer must perform
    </span>
  );
}
