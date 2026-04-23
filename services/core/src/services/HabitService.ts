import { HabitRepository } from "../repositories/HabitRepository.js";
import { formatDate, getDaysAgo, iterateDates } from "../utils/dateUtils.js";

export const HabitService = {
  async getAll() {
    const allHabits = await HabitRepository.findAll();
    const today = formatDate(new Date());
    const weekDates = iterateDates(7);

    const result = await Promise.all(
      allHabits.map(async (h) => {
        const logs = await HabitRepository.findLogsByDateRange(
          h.id,
          weekDates[0],
          weekDates[6]
        );
        
        // Map logs to weekData array [0, 0, 0, 0, 0, 0, 0]
        const weekData = weekDates.map((d) => {
          const log = logs.find((l) => l.logDate === d);
          return log && log.done ? 1 : 0;
        });

        const isDoneToday = weekData[6] === 1;

        // Calculate streak (simple version: consecutive days including today or ending yesterday)
        let streak = 0;
        let checkDate = new Date();
        
        // If not done today, start checking from yesterday
        if (!isDoneToday) {
          checkDate.setDate(checkDate.getDate() - 1);
        }

        while (true) {
          const dateStr = formatDate(checkDate);
          const log = await HabitRepository.findLogByDate(h.id, dateStr);
          if (log && log.done) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
          // Safety break to prevent infinite loop
          if (streak > 1000) break;
        }

        const doneCount = weekData.filter((val) => val === 1).length;
        const rate = Math.round((doneCount / 7) * 100);

        return {
          ...h,
          done: isDoneToday,
          weekData,
          streak,
          rate,
        };
      })
    );

    return result;
  },

  async getStats() {
    const habits = await this.getAll();
    const doneToday = habits.filter((h) => h.done).length;
    const totalHabits = habits.length;
    const bestStreak = Math.max(0, ...habits.map((h) => h.streak));
    
    // Overall week rate: average of all habits' rates
    const overallWeekRate = totalHabits > 0 
      ? Math.round(habits.reduce((acc, h) => acc + h.rate, 0) / totalHabits)
      : 0;

    // Perfect days: days in the last 7 days where ALL habits were done
    let perfectDays = 0;
    const weekDates = iterateDates(7);
    
    for (const d of weekDates) {
      if (totalHabits === 0) break;
      
      let allDone = true;
      for (const h of habits) {
        // We already have weekData for each habit. 
        // Let's find the index of date d in weekDates
        const idx = weekDates.indexOf(d);
        if (h.weekData[idx] === 0) {
          allDone = false;
          break;
        }
      }
      if (allDone) perfectDays++;
    }

    return {
      doneToday,
      totalHabits,
      bestStreak,
      overallWeekRate,
      perfectDays,
    };
  },

  async create(data: { name: string; emoji?: string; color?: string; freq?: "daily" | "weekday" | "custom" }) {
    return HabitRepository.create(data);
  },

  async delete(id: string) {
    return HabitRepository.delete(id);
  },

  async toggleToday(id: string) {
    const today = formatDate(new Date());
    const existing = await HabitRepository.findLogByDate(id, today);
    const newVal = existing ? !existing.done : true;
    await HabitRepository.upsertLog(id, today, newVal);
    return { done: newVal };
  },

  async toggleLog(id: string, logDate: string, done: boolean) {
    await HabitRepository.upsertLog(id, logDate, done);
    return { success: true };
  },
};
