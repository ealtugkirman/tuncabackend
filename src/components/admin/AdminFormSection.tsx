import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type AdminFormSectionProps = {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function AdminFormSection({ title, description, children, className }: AdminFormSectionProps) {
  return (
    <section
      className={cn(
        'rounded-[10px] border border-border bg-card p-6 shadow-none',
        className
      )}
    >
      <div className="mb-5 border-b border-border pb-4">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}
