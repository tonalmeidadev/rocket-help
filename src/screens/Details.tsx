import { useState, useEffect } from 'react'
import { Alert } from 'react-native'
import { VStack, Text, HStack, useTheme, ScrollView, Box } from 'native-base'
import { Hourglass, CircleWavyCheck, DesktopTower, ClipboardText } from 'phosphor-react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import firestore from '@react-native-firebase/firestore'

import { Loading } from '../components/Loading'
import { Header } from '../components/Header'
import { OrderProps } from '../components/Order'
import { CardDetails } from '../components/CardDetails'
import { Input } from '../components/Input'

import { OrderFirestoreDTO } from '../DTOs/OrderFirestoreDTO'
import { dateFormat } from '../utils/firestoreDateFormat'
import { Button } from '../components/Button'

type RouteParams = {
  orderId: string
}

type OrderDetails = OrderProps & {
  description: string
  solution?: string
  closed: string
}

export function Details() {
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdateLoading, setIsUpdateLoading] = useState(false)
  const [solution, setSolution] = useState('')
  const [order, setOrder] = useState<OrderDetails>({} as OrderDetails)

  const { colors } = useTheme()

  const navigation = useNavigation()
  const route = useRoute()
  const { orderId } = route.params as RouteParams

  function handleOrderClose() {
    if(!solution.trim()) {
      return Alert.alert('Solicitação', 'Informe a solução para encerrar a solicitação')
    }

    setIsUpdateLoading(true)

    firestore()
    .collection<OrderFirestoreDTO>('orders')
    .doc(orderId)
    .update({
      status: 'closed',
      solution,
      closed_at: firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      Alert.alert('Solicitação', 'Solicitação encerrada')
      navigation.goBack()
    })
    .catch(error => {
      console.log(error)
      setIsUpdateLoading(false)
      return Alert.alert('Solicitação', 'Não foi possível encerrar a solicitação')
    })
  }

  useEffect(() => {
    const subscriber = firestore()
    .collection<OrderFirestoreDTO>('orders')
    .doc(orderId)
    .get()
    .then(doc => {
      const { patrimony, description, status, created_at, closed_at, solution } = doc.data()

      const closed = closed_at ? dateFormat(closed_at) : null

      setOrder({
        id: doc.id,
        patrimony,
        description,
        status,
        solution: solution ? solution : null,
        when: dateFormat(created_at),
        closed
      })

      setIsLoading(false)
    })
  }, [])

  if(isLoading) {
    return <Loading />
  }

  return (
    <VStack flex={1} bg='gray.700' >
      <Box px={6} bg='gray.600'>
        <Header title='Solicitação' />
      </Box>
      
      <HStack bg='gray.500' justifyContent='center' p={4}>
        {
          order.status === 'closed'
          ? <CircleWavyCheck size={22} color={colors.green[300]} />
          : <Hourglass size={22} color={colors.secondary[700]} />
        }

        <Text
          fontSize='sm'
          color={order.status === 'closed' ? colors.green[300] : colors.secondary[700]}
          textTransform='uppercase'
          ml={2}
        >
          { order.status === 'closed' ? 'finalizado' : 'em andamento' }
        </Text>
      </HStack>

      <ScrollView
        mx={5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 24
        }}
      >
        <CardDetails 
          title='Equipamento'
          description={`Patrimônio ${order.patrimony}`}
          icon={DesktopTower}
        />

        <CardDetails 
          title='Descrição do Problema'
          description={order.description}
          icon={ClipboardText}
          footer={order.when}
        />

        <CardDetails 
          title='Solução'
          description={order.solution}
          icon={CircleWavyCheck}
          footer={order.closed && `Encerrado em ${order.closed}`}
        >
          {
            order.status === 'open' &&
            <Input
              h={32}
              placeholder='Descrição da solução'
              onChangeText={setSolution}
              textAlignVertical='top'
              multiline
            />
          }
        </CardDetails>
      </ScrollView>

      {
        order.status === 'open' &&
        <Button
          title='Encerrar solicitação'
          onPress={handleOrderClose}
          isLoading={isUpdateLoading}
          m={5}
        />
      }

    </VStack>
  )
}