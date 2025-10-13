import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface MetricCardProps {
  title: string                    // Small description (e.g., "Total Revenue")
  value: string | number          // The main metric value
  description?: string            // Optional detailed context
  trend?: {
    value: string
    direction: "up" | "down"
    isPositive?: boolean
  }
  footer?: {
    label: string
    sublabel?: string
    icon?: LucideIcon
  }
  className?: string
}

export function MetricCard({
  title,
  value,
  trend,
  footer,
  className,
}: MetricCardProps) {
  const TrendIcon = trend?.direction === "up" ? TrendingUp : TrendingDown

  return (
    <Card className={cn("@container/card", className)}>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        {trend && (
          <CardAction>
            <Badge variant="outline" className={cn(
              trend.isPositive !== false && trend.direction === "up" && "border-green-200 text-green-700 dark:border-green-800 dark:text-green-400",
              trend.isPositive !== false && trend.direction === "down" && "border-red-200 text-red-700 dark:border-red-800 dark:text-red-400"
            )}>
              <TrendIcon className="size-3" />
              {trend.value}
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      {footer && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {footer.label}
            {footer.icon && <footer.icon className="size-4" />}
          </div>
          {footer.sublabel && (
            <div className="text-muted-foreground">{footer.sublabel}</div>
          )}
        </CardFooter>
      )}
    </Card>
  )
}

// Healthcare-specific metric card variants
export function MemberMetricCard(props: Omit<MetricCardProps, 'className'> & { className?: string }) {
  return <MetricCard {...props} className={cn("border-blue-200 dark:border-blue-800", props.className)} />
}

export function ProviderMetricCard(props: Omit<MetricCardProps, 'className'> & { className?: string }) {
  return <MetricCard {...props} className={cn("border-green-200 dark:border-green-800", props.className)} />
}

export function ComplianceMetricCard(props: Omit<MetricCardProps, 'className'> & { className?: string }) {
  return <MetricCard {...props} className={cn("border-amber-200 dark:border-amber-800", props.className)} />
}