'use client'

import React, { forwardRef } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'navy'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  href?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      href,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 motion-safe:active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer'

    const sizeStyles = {
      sm: 'min-h-[38px] px-3.5 py-1.5 text-xs gap-1.5',
      md: 'min-h-[44px] px-5 py-2.5 text-sm gap-2',
      lg: 'min-h-[48px] px-7 py-3 text-base gap-2.5',
    }

    const variantStyles = {
      primary:
        'bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg shadow-amber-900/10 text-shadow-sm',
      navy:
        'bg-navy hover:bg-slate-900 text-white shadow-md hover:shadow-lg shadow-slate-900/20',
      secondary:
        'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-navy dark:text-white',
      outline:
        'border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-navy dark:text-white',
      ghost:
        'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200',
    }

    const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`.trim()

    const content = (
      <>
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </>
    )

    if (href) {
      return (
        <Link
          href={href}
          className={combinedClassName}
          ref={ref as React.Ref<HTMLAnchorElement>}
        >
          {content}
        </Link>
      )
    }

    return (
      <button
        type={type}
        className={combinedClassName}
        disabled={disabled || isLoading}
        ref={ref as React.Ref<HTMLButtonElement>}
        {...props}
      >
        {content}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
