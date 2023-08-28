import { generateRangeFromYearBeginning } from '../utils/generate-range-from-year-beginning'
import { HabitDay } from './HabitDay'

export function SummaryTable() {
  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

  const summaryDates = generateRangeFromYearBeginning()

  const minimumSummaDatesSize = 18 * 7 // 18 weeks
  const amountOfDaysToFill = minimumSummaDatesSize - summaryDates.length

  return (
    <main className="w-full flex">
      <div className="grid grid-rows-7 grid-flow-row gap-3 pb-4">
        {weekDays.map((day, index) => {
          return (
            <div
              key={index}
              className="text-zinc-400 text-xl h-10 w-10 flex items-start justify-center font-bold"
            >
              {day}
            </div>
          )
        })}
      </div>
      <div className="grid grid-rows-7 grid-flow-col gap-3 overflow-x-auto pb-2">
        {summaryDates.map((date) => {
          return (
            <HabitDay
              key={date.toDateString()}
              amount={5}
              completed={Math.round(Math.random() * 5)}
            />
          )
        })}
        {amountOfDaysToFill > 0 &&
          Array.from({ length: amountOfDaysToFill }).map((_, index) => {
            return (
              <div
                key={index}
                className="w-10 h-10 bg-zinc-900 border-2 border-zinc-800 rounded-lg opacity-40 cursor-not-allowed"
              />
            )
          })}
      </div>
    </main>
  )
}
