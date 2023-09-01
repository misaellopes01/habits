import {
  Text,
  TouchableOpacity,
  View,
  TouchableOpacityProps,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import colors from 'tailwindcss/colors'
import Animated, { ZoomOutRotate, ZoomInRotate } from 'react-native-reanimated'

interface CheckBoxProps extends TouchableOpacityProps {
  checked?: boolean
  title: string
}

export function CheckBox({ checked = false, title, ...rest }: CheckBoxProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="flex-row mb-2 items-center"
      {...rest}
    >
      {checked ? (
        <Animated.View
          className="h-8 w-8 bg-green-500 rounded-lg items-center justify-center"
          entering={ZoomInRotate}
          exiting={ZoomOutRotate}
        >
          <Feather name="check" size={20} color={colors.white} />
        </Animated.View>
      ) : (
        <View className="h-8 w-8 bg-zinc-900 rounded-lg" />
      )}
      <Text className="text-white font-semibold text-base ml-3">{title}</Text>
    </TouchableOpacity>
  )
}
