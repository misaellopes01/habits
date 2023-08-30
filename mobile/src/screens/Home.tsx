import { View, Text, ScrollView, Alert } from 'react-native'
import { Header } from '../components/Header'
import { DAY_SIZE, HabitDay } from '../components/HabitDay'
import { generateRangeDatesFromYearStart } from '../utils/generate-range-between-dates'
import { useNavigation } from '@react-navigation/native'
import { useEffect, useState } from 'react'
import { api } from '../lib/axios'
import { Loading } from '../components/Loading'
import dayjs from 'dayjs'

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const datesFromStartOfTheYear = generateRangeDatesFromYearStart()
const minimumSummaryDatesSize = 18 * 5
const amountOfDaysToFill =
  minimumSummaryDatesSize - datesFromStartOfTheYear.length

interface SummaryResponseProps {
  id: string
  date: string
  completed: number
  amount: number
}

export function Home() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<SummaryResponseProps[]>([])
  const { navigate } = useNavigation()

  async function fetchHabitsSummary() {
    try {
      setLoading(true)
      const response = await api.get<SummaryResponseProps[]>('/summary')
      setSummary(response.data)
    } catch (error) {
      Alert.alert('Ops', 'Nao foi passível carregar os hábitos')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHabitsSummary()
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <Header />
      <View className="flex-row mt-6 mb-2">
        {weekDays.map((weekDay, index) => (
          <Text
            key={`${weekDay}-${index}`}
            className="text-zinc-400 text-xl font-bold text-center mx-1"
            style={{ width: DAY_SIZE, height: DAY_SIZE }}
          >
            {weekDay}
          </Text>
        ))}
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="flex-row flex-wrap">
          {datesFromStartOfTheYear.map((date) => {
            const dayInSummary = summary.find((day) => {
              return dayjs(date).isSame(day.date, 'day')
            })
            return (
              <HabitDay
                key={date.toISOString()}
                onPress={() => navigate('habit', { date: date.toISOString() })}
                date={date}
                amount={dayInSummary?.amount}
                completed={dayInSummary?.completed}
              />
            )
          })}
          {amountOfDaysToFill > 0 &&
            Array.from({ length: amountOfDaysToFill }).map((_, index) => (
              <View
                key={index}
                className="bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-40"
                style={{ width: DAY_SIZE, height: DAY_SIZE }}
              />
            ))}
        </View>
      </ScrollView>
    </View>
  )
}
