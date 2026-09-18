import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { IconCheck, IconClipboard } from './icons'

const FEATURES = [
  'Créez et organisez vos tâches en quelques secondes',
  'Suivez leur avancement avec des statuts clairs',
  'Retrouvez tout instantanément grâce à la recherche',
]

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-10"
          keyboardShouldPersistTaps="handled"
        >
          <LinearGradient
            colors={['#4f46e5', '#4f46e5', '#c026d3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-b-[32px]"
            style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 }}
          >
            <View className="flex-row items-center gap-2.5">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <IconClipboard size={18} color="#ffffff" />
              </View>
              <Text className="font-extrabold text-lg text-white">Task Manager</Text>
            </View>

            <Text className="mt-6 font-extrabold text-2xl leading-8 text-white">
              Organisez votre travail, une tâche à la fois.
            </Text>

            <View className="mt-5 gap-2.5">
              {FEATURES.map((feature) => (
                <View key={feature} className="flex-row items-start gap-2.5">
                  <View className="mt-0.5 h-5 w-5 items-center justify-center rounded-full bg-white/15">
                    <IconCheck size={11} color="#ffffff" />
                  </View>
                  <Text className="flex-1 text-indigo-50 text-sm leading-5">{feature}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>

          <View className="-mt-6 px-4">
            <View className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/10">
              <Text className="font-extrabold text-2xl text-slate-900">{title}</Text>
              <Text className="mt-1.5 text-slate-500 text-sm">{subtitle}</Text>
              <View className="mt-6">{children}</View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
