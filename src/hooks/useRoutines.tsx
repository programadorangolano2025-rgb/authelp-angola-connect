import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

interface Routine {
  id: string
  title: string
  description?: string
  icon_name?: string
  time_slots?: any
  days_of_week?: number[] // Array de números (0=domingo, 1=segunda, etc.)
  is_active: boolean
  created_at: string
  updated_at: string
  user_id: string
}

interface RoutineProgress {
  routineId: string
  date: string
  completed: boolean
}

export const useRoutines = () => {
  const { user } = useAuth()
  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)
  const [todayProgress, setTodayProgress] = useState<RoutineProgress[]>([])

  // Load user routines
  useEffect(() => {
    if (user) {
      loadRoutines()
      loadTodayProgress()
    }
  }, [user])

  const loadRoutines = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (error) throw error
      setRoutines((data as Routine[]) || [])
    } catch (error) {
      console.error('Error loading routines:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTodayProgress = async () => {
    if (!user) return

    const today = new Date().toISOString().split('T')[0]
    
    try {
      // For now, we'll use localStorage to track daily progress
      // In a real implementation, you'd have a separate progress table
      const storedProgress = localStorage.getItem(`routine_progress_${user.id}_${today}`)
      if (storedProgress) {
        setTodayProgress(JSON.parse(storedProgress))
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    }
  }

  const toggleRoutineCompletion = async (routineId: string) => {
    const today = new Date().toISOString().split('T')[0]
    const existingProgress = todayProgress.find(p => p.routineId === routineId)
    
    let newProgress: RoutineProgress[]
    
    if (existingProgress) {
      // Toggle completion
      newProgress = todayProgress.map(p => 
        p.routineId === routineId 
          ? { ...p, completed: !p.completed }
          : p
      )
    } else {
      // Add new completion
      newProgress = [...todayProgress, {
        routineId,
        date: today,
        completed: true
      }]
    }

    setTodayProgress(newProgress)
    
    // Store in localStorage
    localStorage.setItem(`routine_progress_${user.id}_${today}`, JSON.stringify(newProgress))
  }

  const createRoutine = async (routineData: {
    title: string
    description?: string
    icon_name?: string
    time_slots?: any
    days_of_week?: number[]
  }) => {
    if (!user) return false

    try {
      const { data, error } = await supabase
        .from('routines')
        .insert({
          ...routineData,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error
      
      setRoutines(prev => [...prev, data as Routine])
      return true
    } catch (error) {
      console.error('Error creating routine:', error)
      return false
    }
  }

  const deleteRoutine = async (routineId: string) => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from('routines')
        .update({ is_active: false })
        .eq('id', routineId)
        .eq('user_id', user.id)

      if (error) throw error
      
      setRoutines(prev => prev.filter(r => r.id !== routineId))
      return true
    } catch (error) {
      console.error('Error deleting routine:', error)
      return false
    }
  }

  const isRoutineCompleted = (routineId: string) => {
    return todayProgress.find(p => p.routineId === routineId)?.completed || false
  }

  const getCompletedCount = () => {
    return todayProgress.filter(p => p.completed).length
  }

  return {
    routines,
    loading,
    todayProgress,
    toggleRoutineCompletion,
    createRoutine,
    deleteRoutine,
    isRoutineCompleted,
    getCompletedCount,
    reloadRoutines: loadRoutines
  }
}