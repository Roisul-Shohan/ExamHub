import * as React from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-4 py-2.5 text-base rounded-lg border border-slate-300 bg-white placeholder-slate-400 text-slate-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 ${className}`}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
