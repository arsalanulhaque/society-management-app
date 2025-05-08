// components/ui/IconTooltip.tsx
import React from "react"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

interface IconTooltipProps {
  tooltip: string
  children: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
  delayDuration?: number
}

export const IconTooltip = ({
  tooltip,
  children,
  side = "top",
  sideOffset = 4,
  delayDuration = 100,
}: IconTooltipProps) => (
  <Tooltip delayDuration={delayDuration}>
    <TooltipTrigger asChild>{children}</TooltipTrigger>
    <TooltipContent side={side} sideOffset={sideOffset}>
      {tooltip}
    </TooltipContent>
  </Tooltip>
)
