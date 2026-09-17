import { Feather } from '@expo/vector-icons'
import type { ComponentProps } from 'react'

type FeatherName = ComponentProps<typeof Feather>['name']

function makeIcon(name: FeatherName) {
  return function Icon({ size = 18, color = '#1e293b' }: { size?: number; color?: string }) {
    return <Feather name={name} size={size} color={color} />
  }
}

export const IconCheck = makeIcon('check')
export const IconPlus = makeIcon('plus')
export const IconSearch = makeIcon('search')
export const IconPencil = makeIcon('edit-2')
export const IconTrash = makeIcon('trash-2')
export const IconLogout = makeIcon('log-out')
export const IconClipboard = makeIcon('clipboard')
export const IconMail = makeIcon('mail')
export const IconLock = makeIcon('lock')
export const IconUser = makeIcon('user')
