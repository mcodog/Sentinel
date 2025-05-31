import React from 'react'
import PropTypes from 'prop-types'

export default function FloatingButton({
  onClick,
  icon,
  backgroundColor = '#4f46e5', 
  color = 'white',
  size = 'medium',
  position = 'bottom-right',
  children,
  disabled = false,
  className = '',
  ariaLabel = 'Floating action button'
}) {
  // Define size variants
  const sizeStyles = {
    small: 'w-10 h-10 text-sm',
    medium: 'w-12 h-12 text-base',
    large: 'w-14 h-14 text-lg'
  }

  // Define position variants
  const positionStyles = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
    'center': 'bottom-1/2 right-1/2 transform translate-x-1/2 translate-y-1/2'
  }

  // Combine all styles
  const buttonStyles = {
    position: 'fixed',
    backgroundColor,
    color
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-full flex items-center justify-center shadow-lg
        ${sizeStyles[size]}
        ${positionStyles[position]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 active:scale-95 transition-all'}
        ${className}
      `}
      style={buttonStyles}
      aria-label={ariaLabel}
    >
      {icon ? (
        <span className="flex items-center justify-center">
          {icon}
        </span>
      ) : children}
    </button>
  )
}

FloatingButton.propTypes = {
  onClick: PropTypes.func,
  icon: PropTypes.node,
  backgroundColor: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  position: PropTypes.oneOf(['bottom-right', 'bottom-left', 'top-right', 'top-left', 'center']),
  children: PropTypes.node,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  ariaLabel: PropTypes.string
}
