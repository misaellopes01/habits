import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { Home } from '../screens/Home'
import { Habit } from '../screens/Habit'
import { NewHabit } from '../screens/NewHabit'

const { Navigator, Screen } = createNativeStackNavigator()

export function AppRoutes() {
  return (
    <Navigator screenOptions={{ headerShown: false }}>
      <Screen name="home" component={Home} />
      <Screen name="new_habit" component={NewHabit} />
      <Screen name="habit" component={Habit} />
    </Navigator>
  )
}
