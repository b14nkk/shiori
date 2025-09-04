import React from 'react';
import { cn } from '../../lib/utils';
import styles from './Input.module.scss';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'outline';
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', error = false, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          styles.input,
          styles[variant],
          error && styles.error,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'outline';
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'default', error = false, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          styles.textarea,
          styles[variant],
          error && styles.error,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { Input, Textarea };
