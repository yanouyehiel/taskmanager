import { useState } from 'react'
import { Link, router } from 'expo-router'
import { Text, View } from 'react-native'
import { login } from '@/services/authService'
import { useAuth } from '@/context/AuthContext'
import { AuthLayout } from '@/components/AuthLayout'
import { TextField } from '@/components/TextField'
import { Button } from '@/components/Button'
import { IconLock, IconMail } from '@/components/icons'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuth()

  async function handleSubmit() {
    if (!email || !password) return
    setError(null)
    setLoading(true)
    try {
      const { user, token } = await login({ email, password })
      await setAuth(user, token)
      router.replace('/tasks')
    } catch {
      setError('Email ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Bon retour" subtitle="Connectez-vous pour retrouver vos tâches.">
      <View className="gap-4">
        {error && (
          <View className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
            <Text className="text-red-700 text-sm">{error}</Text>
          </View>
        )}

        <TextField
          label="Email"
          icon={<IconMail size={16} color="#94a3b8" />}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="vous@exemple.com"
        />

        <TextField
          label="Mot de passe"
          icon={<IconLock size={16} color="#94a3b8" />}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          placeholder="••••••••"
        />

        <Button title="Se connecter" onPress={handleSubmit} loading={loading} className="mt-1" />

        <View className="mt-2 flex-row justify-center gap-1">
          <Text className="text-slate-500 text-sm">Pas de compte ?</Text>
          <Link href="/register" className="font-semibold text-indigo-600 text-sm">
            S'inscrire
          </Link>
        </View>
      </View>
    </AuthLayout>
  )
}
