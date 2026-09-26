import React from "react";

export function Input({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  helperText,
  icon: Icon = null,
  rightElement = null,
  className = "",
  containerClassName = "",
  required = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-700 select-none">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-2.5 text-slate-400 pointer-events-none flex items-center">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`h-9 w-full rounded-md border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition-colors disabled:bg-slate-50 disabled:text-slate-500 ${
            Icon ? "pl-8" : "px-3"
          } ${rightElement ? "pr-10" : "px-3"} ${
            error ? "border-rose-400 focus:ring-rose-200 focus:border-rose-500" : "border-slate-200"
          } ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-2.5 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-rose-600">{error}</span>}
      {helperText && !error && <span className="text-xs text-slate-500">{helperText}</span>}
    </div>
  );
}

export function Textarea({
  label,
  id,
  placeholder,
  value,
  onChange,
  rows = 4,
  disabled = false,
  error,
  helperText,
  className = "",
  containerClassName = "",
  required = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-700 select-none">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        disabled={disabled}
        className={`w-full rounded-md border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 p-3 transition-colors disabled:bg-slate-50 disabled:text-slate-500 ${
          error ? "border-rose-400 focus:ring-rose-200 focus:border-rose-500" : "border-slate-200"
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-600">{error}</span>}
      {helperText && !error && <span className="text-xs text-slate-500">{helperText}</span>}
    </div>
  );
}
