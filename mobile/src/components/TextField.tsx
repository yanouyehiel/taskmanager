import { useState, type ReactNode } from 'react'
import { Text, TextInput, View, type TextInputProps } from 'react-native'

export function TextField({
  label,
  icon,
  className = '',
  ...props
}: TextInputProps & { label: string; icon?: ReactNode; className?: string }) {
  const [focused, setFocused] = useState(false)

  return (
    <View className={className}>
      <Text className="mb-1.5 font-medium text-slate-700 text-sm">{label}</Text>
      <View
        className={`flex-row items-center rounded-lg border bg-white px-3 ${
          focused ? 'border-indigo-500' : 'border-slate-300'
        }`}
      >
        {icon && <View className="mr-2.5">{icon}</View>}
        <TextInput
          placeholderTextColor="#94a3b8"
          onFocus={(e) => {
            setFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            props.onBlur?.(e)
          }}
          className="flex-1 py-3 text-slate-900 text-sm"
          {...props}
        />
      </View>
    </View>
  )
}
