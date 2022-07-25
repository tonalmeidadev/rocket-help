import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useTheme } from 'native-base'

import { Home } from '../screens/Home'
import { Register } from '../screens/Register'
import { Details } from '../screens/Details'

const { Navigator, Screen } = createNativeStackNavigator()

export function AppRoutes() {
  const { colors } = useTheme()

  return (
    <Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Screen name='home' component={Home} />
      <Screen name='new' component={Register} />
      <Screen name='details' component={Details} />
    </Navigator>
  )
}