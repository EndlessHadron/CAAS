'use client'

import { ReactNode } from 'react'

interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => ReactNode
  className?: string
  mobileLabel?: string // Custom label for mobile view
  hideOnMobile?: boolean // Hide this column on mobile
}

interface MobileResponsiveTableProps<T> {
  data: T[]
  columns: Column[]
  className?: string
  emptyMessage?: string
  mobileCardClassName?: string
}

export function MobileResponsiveTable<T extends Record<string, any>>({
  data,
  columns,
  className = '',
  emptyMessage = 'No data found.',
  mobileCardClassName = ''
}: MobileResponsiveTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <>
      {/* Desktop Table View - hidden on mobile */}
      <div className={`hidden md:block overflow-x-auto ${className}`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - visible only on mobile */}
      <div className={`md:hidden space-y-4 ${mobileCardClassName}`}>
        {data.map((row, rowIndex) => (
          <div key={rowIndex} className="bg-white rounded-lg shadow border border-gray-200 p-4">
            {columns
              .filter(column => !column.hideOnMobile)
              .map((column) => {
                const value = column.render ? column.render(row[column.key], row) : row[column.key];
                const label = column.mobileLabel || column.label;
                
                // Don't render empty values
                if (value === null || value === undefined || value === '') return null;
                
                return (
                  <div key={column.key} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-sm font-medium text-gray-600 flex-shrink-0 w-24">
                      {label}:
                    </span>
                    <div className="text-sm text-gray-900 text-right flex-1 ml-3">
                      {value}
                    </div>
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </>
  )
}

// Enhanced Action Button component for mobile touch targets
interface MobileActionButtonProps {
  onClick: () => void
  children: ReactNode
  className?: string
  title?: string
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function MobileActionButton({
  onClick,
  children,
  className = '',
  title,
  variant = 'secondary',
  size = 'md'
}: MobileActionButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500", 
    danger: "bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500"
  }
  
  const sizeClasses = {
    sm: "px-3 py-2 text-sm min-w-[40px] min-h-[40px]", // Mobile-friendly minimum
    md: "px-4 py-2 text-sm min-w-[44px] min-h-[44px]", // Standard touch target
    lg: "px-6 py-3 text-base min-w-[48px] min-h-[48px]"  // Large touch target
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      title={title}
    >
      {children}
    </button>
  )
}

// Action buttons group for mobile
interface MobileActionGroupProps {
  children: ReactNode
  className?: string
}

export function MobileActionGroup({ children, className = '' }: MobileActionGroupProps) {
  return (
    <div className={`flex flex-wrap gap-2 mt-3 ${className}`}>
      {children}
    </div>
  )
}