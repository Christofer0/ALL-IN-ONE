import { GoalRepository } from "../repositories/GoalRepository.js";

export const GoalService = {
  async getAll() {
    const goalsRecs = await GoalRepository.findAll();
    
    return goalsRecs.map((g) => {
      const { keyResults: krRecs, ...rest } = g;
      const transformedKrs = (krRecs || []).map((kr) => {
        let title = kr.title;
        // Recovery logic for bad data: if title is a JSON string with a 'title' property
        if (typeof title === "string" && title.startsWith('{"title":')) {
          try {
            const parsed = JSON.parse(title);
            if (parsed.title) title = parsed.title;
          } catch (e) {}
        }
        return { ...kr, title };
      });

      const totalKrs = transformedKrs.length;
      const doneKrs = transformedKrs.filter((kr) => kr.done).length;
      const progress = totalKrs > 0 ? Math.round((doneKrs / totalKrs) * 100) : 0;
      
      return {
        ...rest,
        krs: transformedKrs,
        progress,
      };
    });
  },

  async getStats() {
    const allGoals = await GoalRepository.findAll();
    const activeGoals = allGoals.filter((g) => !g.isArchived);
    
    const totalKrs = activeGoals.reduce((acc, g) => acc + g.keyResults.length, 0);
    const doneKrs = activeGoals.reduce((acc, g) => acc + g.keyResults.filter((kr) => kr.done).length, 0);
    
    const totalProgress = activeGoals.reduce((acc, g) => {
      const gTotal = g.keyResults.length;
      const gDone = g.keyResults.filter((kr) => kr.done).length;
      return acc + (gTotal > 0 ? (gDone / gTotal) : 0);
    }, 0);

    return {
      activeCount: activeGoals.length,
      avgProgress: activeGoals.length > 0 ? Math.round((totalProgress / activeGoals.length) * 100) : 0,
      krDone: doneKrs,
      krTotal: totalKrs,
      krRatio: `${doneKrs}/${totalKrs}`,
    };
  },

  async create(data: any) {
    const { krs, ...goalData } = data;
    const newGoal = await GoalRepository.create(goalData);
    
    if (krs && Array.isArray(krs) && krs.length > 0) {
      const krsToInsert = krs.map((kr: any) => ({
        goalId: newGoal.id,
        title: typeof kr === "string" ? kr : kr.title,
      }));
      await GoalRepository.createKeyResults(krsToInsert);
    }
    
    const goal = await GoalRepository.findById(newGoal.id);
    if (!goal) return null;
    const { keyResults, ...rest } = goal;
    return { 
      ...rest, 
      krs: (keyResults || []).map(kr => {
        let title = kr.title;
        if (typeof title === "string" && title.startsWith('{"title":')) {
          try {
            const parsed = JSON.parse(title);
            if (parsed.title) title = parsed.title;
          } catch (e) {}
        }
        return { ...kr, title };
      })
    };
  },

  async update(id: string, data: any) {
    const { krs, ...goalData } = data;
    
    // Update main goal metadata
    await GoalRepository.update(id, goalData);
    
    if (krs && Array.isArray(krs)) {
      const currentKrs = (await GoalRepository.findById(id))?.keyResults || [];
      const currentKrIds = currentKrs.map(k => k.id);
      
      const incomingKrs = krs as { id?: string; title: string }[];
      const incomingKrIds = incomingKrs.map(k => k.id).filter(Boolean);
      
      // 1. Delete removed KRs
      for (const krId of currentKrIds) {
        if (!incomingKrIds.includes(krId)) {
          await GoalRepository.deleteKeyResult(krId);
        }
      }
      
      // 2. Update existing KRs and Add new ones
      for (const kr of incomingKrs) {
        if (kr.id) {
          // Update existing
          await GoalRepository.updateKeyResult(kr.id, { title: kr.title });
        } else {
          // Add new
          await GoalRepository.createKeyResults([{ goalId: id, title: kr.title }]);
        }
      }
    }
    
    const goal = await GoalRepository.findById(id);
    if (!goal) return null;
    const { keyResults, ...rest } = goal;
    return { 
      ...rest, 
      krs: (keyResults || []).map(kr => {
        let title = kr.title;
        if (typeof title === "string" && title.startsWith('{"title":')) {
          try {
            const parsed = JSON.parse(title);
            if (parsed.title) title = parsed.title;
          } catch (e) {}
        }
        return { ...kr, title };
      })
    };
  },

  async archive(id: string) {
    return GoalRepository.archive(id);
  },

  async delete(id: string) {
    return GoalRepository.delete(id);
  },

  async toggleKR(id: string, krId: string) {
    const updatedKr = await GoalRepository.toggleKR(krId);
    
    // Check if goal should be marked as completed
    const goal = await GoalRepository.findById(id);
    if (goal) {
      const allDone = goal.keyResults.every((kr) => kr.done);
      if (allDone && goal.status !== "completed") {
        await GoalRepository.update(id, { status: "completed" });
      } else if (!allDone && goal.status === "completed") {
        await GoalRepository.update(id, { status: "on-track" });
      }
    }
    
    return updatedKr;
  },
};
