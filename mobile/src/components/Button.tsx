import type { ReactNode } from 'react'
import { ActivityIndicator, Pressable, Text } from 'react-native'

const VARIANT_STYLE = {
  primary: {
    wrap: 'bg-indigo-600 active:bg-indigo-700 shadow-sm shadow-indigo-600/30',
    text: 'text-white',
  },
  secondary: {
    wrap: 'bg-white border border-slate-300 active:bg-slate-100',
    text: 'text-slate-700',
  },
} as const

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  className = '',
}: {
  title: string
  onPress: () => void
  variant?: keyof typeof VARIANT_STYLE
  loading?: boolean
  disabled?: boolean
  icon?: ReactNode
  className?: string
}) {
  const style = VARIANT_STYLE[variant]
  const isDisabled = disabled || loading

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`flex-row items-center justify-center gap-2 rounded-lg px-4 py-3 ${style.wrap} ${
        isDisabled ? 'opacity-60' : ''
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#ffffff' : '#4f46e5'}
        />
      ) : (
        icon
      )}
      <Text className={`text-sm font-semibold ${style.text}`}>{title}</Text>
    </Pressable>
  )
}
