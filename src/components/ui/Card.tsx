import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'border border-slate-200 bg-white',
      elevated: 'border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
    };

    return (
      <div
        ref={ref}
        className={`rounded-xl p-6 ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export default Card;
