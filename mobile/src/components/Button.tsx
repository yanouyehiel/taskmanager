import type { ReactNode } from 'react'
import { ActivityIndicator, Pressable, Text } from 'react-native'

const VARIANT_STYLE = {
  primary: {
    wrap: 'bg-indigo-600 active:bg-indigo-700',
    text: 'text-white',
  },
  secondary: {
    wrap: 'bg-white border border-slate-300 active:bg-slate-100',
    text: 'text-slate-700',
  },
} as const

// Plain RN styles instead of NativeWind's `shadow-*`/`opacity-*` classes on
// this Pressable, which are known to break expo-router's navigation context.
// https://github.com/nativewind/nativewind/issues/1536
const PRIMARY_SHADOW = {
  shadowColor: '#4f46e5',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.3,
  shadowRadius: 2,
  elevation: 2,
}
const DISABLED_STYLE = { opacity: 0.6 }

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
      className={`flex-row items-center justify-center gap-2 rounded-lg px-4 py-3 ${style.wrap} ${className}`}
      style={[
        variant === 'primary' ? PRIMARY_SHADOW : undefined,
        isDisabled ? DISABLED_STYLE : undefined,
      ]}
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
