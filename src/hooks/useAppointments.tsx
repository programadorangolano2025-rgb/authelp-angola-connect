import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

interface Service {
  id: string
  name: string
  description?: string
  category: string
  location?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  rating?: number
  total_reviews?: number
  verified?: boolean
}

interface Professional {
  id: string
  full_name: string
  user_type: string
  bio?: string
  phone?: string
  location?: string
}

interface Appointment {
  id: string
  patient_id: string
  service_id: string
  appointment_date: string
  status?: string
  notes?: string
  created_at: string
  updated_at: string
  services?: Service
  profiles?: Professional
}

export const useAppointments = () => {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      Promise.all([
        loadAppointments(),
        loadServices(),
        loadProfessionals()
      ]).finally(() => setLoading(false))
    }
  }, [user])

  const loadAppointments = async () => {
    if (!user) return false

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (
            id,
            name,
            description,
            category,
            location,
            phone,
            email
          )
        `)
        .eq('patient_id', user.id)
        .order('appointment_date', { ascending: true })

      if (error) throw error
      setAppointments(data || [])
      return true
    } catch (error) {
      console.error('Error loading appointments:', error)
      return false
    }
  }

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name')

      if (error) throw error
      setServices(data || [])
      return true
    } catch (error) {
      console.error('Error loading services:', error)
      return false
    }
  }

  const loadProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'professional')
        .order('full_name')

      if (error) throw error
      setProfessionals(data || [])
      return true
    } catch (error) {
      console.error('Error loading professionals:', error)
      return false
    }
  }

  const createAppointment = async (appointmentData: {
    service_id: string
    appointment_date: string
    notes?: string
  }) => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: user.id,
          ...appointmentData,
          status: 'scheduled'
        })

      if (error) throw error
      await loadAppointments()
      return true
    } catch (error) {
      console.error('Error creating appointment:', error)
      return false
    }
  }

  const updateAppointment = async (appointmentId: string, updates: Partial<Appointment>) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', appointmentId)
        .eq('patient_id', user?.id)

      if (error) throw error
      await loadAppointments()
      return true
    } catch (error) {
      console.error('Error updating appointment:', error)
      return false
    }
  }

  const cancelAppointment = async (appointmentId: string) => {
    return updateAppointment(appointmentId, { status: 'cancelled' })
  }

  const getUpcomingAppointments = () => {
    const now = new Date()
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date)
      return aptDate > now && apt.status !== 'cancelled'
    })
  }

  const getAvailableTimeSlots = (date: string) => {
    // Generate time slots from 8:00 to 18:00 with 1-hour intervals
    const slots = []
    for (let hour = 8; hour <= 17; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`
      
      // Check if this slot is already booked for the selected date
      const isBooked = appointments.some(apt => {
        const aptDateOnly = new Date(apt.appointment_date).toISOString().split('T')[0]
        return aptDateOnly === date && apt.status !== 'cancelled'
      })
      
      if (!isBooked) {
        slots.push(timeSlot)
      }
    }
    return slots
  }

  return {
    appointments,
    services,
    professionals,
    loading,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    getUpcomingAppointments,
    getAvailableTimeSlots,
    reloadAppointments: loadAppointments
  }
}