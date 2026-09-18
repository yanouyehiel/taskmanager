import { StyleSheet } from 'react-native'

// NativeWind's `shadow-*` classes on a Pressable can trigger a CSS-interop
// race condition that breaks expo-router's navigation context, so this
// shadow is applied as a plain RN style instead.
// https://github.com/nativewind/nativewind/issues/1536
export const ACTIVE_TAB_SHADOW = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
}).shadow
