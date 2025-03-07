import * as React from 'react'
import { cn } from '@/utilities/ui'

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, as: Component = 'div', ...props }, ref) => {
    return (
      <Component ref={ref} className={cn('container mx-auto px-4 md:px-6', className)} {...props} />
    )
  },
)

Container.displayName = 'Container'
