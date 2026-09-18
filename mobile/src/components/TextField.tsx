import { useState, type ReactNode } from 'react'
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native'
import { IconEye, IconEyeOff } from './icons'

export function TextField({
  label,
  icon,
  className = '',
  secureTextEntry,
  ...props
}: TextInputProps & { label: string; icon?: ReactNode; className?: string }) {
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(false)
  const isPassword = !!secureTextEntry

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
          key={isPassword ? String(visible) : undefined}
          placeholderTextColor="#94a3b8"
          onFocus={(e) => {
            setFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            props.onBlur?.(e)
          }}
          secureTextEntry={isPassword && !visible}
          className="flex-1 py-3 text-slate-900 text-sm"
          {...props}
        />
        {isPassword && (
          <Pressable onPress={() => setVisible((v) => !v)} hitSlop={8} className="ml-2.5 py-1">
            {visible ? (
              <IconEyeOff size={16} color="#94a3b8" />
            ) : (
              <IconEye size={16} color="#94a3b8" />
            )}
          </Pressable>
        )}
      </View>
    </View>
  )
}
