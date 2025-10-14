# Metric Card Component Standard

## Overview

The `MetricCard` component is the standardized way to display key performance indicators (KPIs) and metrics across the CHC Insight CRM dashboard. It provides a consistent, accessible, and responsive design for healthcare data visualization.

## Features

- **Responsive Design**: Uses container queries for optimal display across screen sizes
- **Trend Indicators**: Built-in support for trend visualization with icons and colors
- **Healthcare Context**: Specialized variants for different healthcare domains
- **Accessibility**: Proper semantic structure and ARIA support
- **Consistent Styling**: Follows shadcn/ui design system with oklch colors

## Basic Usage

```tsx
import { MetricCard } from "@/components/ui/metric-card"
import { Users } from "lucide-react"

<MetricCard
  title="Total Active LTSS Members"
  value="2,847"
  trend={{
    value: "+8.2%",
    direction: "up",
    isPositive: true
  }}
  footer={{
    label: "Growing membership base",
    sublabel: "Enrollment up from last quarter",
    icon: Users
  }}
/>
```

## Healthcare-Specific Variants

### MemberMetricCard
For member-related metrics (blue accent)
```tsx
<MemberMetricCard
  title="Total Active LTSS Members"
  value="2,847"
  // ... other props
/>
```

### ProviderMetricCard
For provider network metrics (green accent)
```tsx
<ProviderMetricCard
  title="Active LTSS Providers"
  value="156"
  // ... other props
/>
```

### ComplianceMetricCard
For compliance and regulatory metrics (amber accent)
```tsx
<ComplianceMetricCard
  title="LTSS Assessment Compliance"
  value="94.2%"
  // ... other props
/>
```

## Props Interface

```tsx
interface MetricCardProps {
  title: string                    // Metric description (appears small above value)
  value: string | number          // The primary metric value
  description?: string            // Optional detailed context
  trend?: {
    value: string                 // Trend percentage/change
    direction: "up" | "down"      // Trend direction
    isPositive?: boolean          // Whether trend is good (affects colors)
  }
  footer?: {
    label: string                 // Footer main text
    sublabel?: string             // Footer secondary text
    icon?: LucideIcon            // Optional footer icon
  }
  className?: string              // Additional CSS classes
}
```

## Grid Layout Standard

Use this container class for consistent dashboard layouts:

```tsx
<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
  {/* Your MetricCard components */}
</div>
```

## Design Guidelines

### Colors
- **Positive trends**: Green indicators for good performance
- **Negative trends**: Red indicators for concerning metrics
- **Neutral trends**: Default colors for informational changes

### Typography
- **Values**: Large, tabular numbers for easy scanning
- **Descriptions**: Muted text for context
- **Trends**: Bold indicators with icons

### Responsive Behavior
- **Mobile**: Single column layout
- **Tablet**: 2-column grid
- **Desktop**: Up to 4-column grid
- **Container queries**: Text scales based on card width

## Healthcare Context Examples

### Member Metrics
- Active member counts
- Enrollment trends
- Member satisfaction scores
- Care plan completion rates

### Provider Metrics
- Network size and growth
- Provider performance ratings
- Credentialing status
- Service capacity utilization

### Compliance Metrics
- Assessment completion rates
- Regulatory compliance scores
- Audit findings
- Documentation quality

### Quality Metrics
- Care quality ratings
- Outcome measurements
- Patient safety indicators
- Performance benchmarks

## Best Practices

1. **Consistent Value Formatting**: Use appropriate number formatting (commas, percentages, decimals)
2. **Meaningful Descriptions**: Provide clear context for each metric
3. **Appropriate Trends**: Only show trends when they add value
4. **Accessible Icons**: Use Lucide React icons with proper semantic meaning
5. **Color Coding**: Use healthcare-specific variants to group related metrics
6. **Performance**: Avoid complex calculations in render; pre-process data

## HIPAA Considerations

- Never display PHI in metric cards
- Use aggregated, de-identified data only
- Implement proper access controls for sensitive metrics
- Ensure audit trails for metric access