import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const AuthTest = () => {
  const { user, session, loading } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [authStatus, setAuthStatus] = useState('checking...')

  useEffect(() => {
    if (loading) {
      setAuthStatus('Loading...')
      return
    }

    if (user) {
      setAuthStatus('Authenticated')
      // Try to fetch user profile
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle()
          
          if (error) {
            console.error('Profile fetch error:', error)
          } else {
            setProfile(data)
          }
        } catch (err) {
          console.error('Profile fetch exception:', err)
        }
      }
      
      fetchProfile()
    } else {
      setAuthStatus('Not authenticated')
    }
  }, [user, loading])

  const testDatabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('count').single()
      console.log('Database test result:', data, error)
    } catch (err) {
      console.error('Database test error:', err)
    }
  }

  if (loading) {
    return <div className="p-4">Loading authentication...</div>
  }

  return (
    <Card className="max-w-md mx-auto m-4">
      <CardHeader>
        <CardTitle>Auth Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <strong>Status:</strong> {authStatus}
        </div>
        
        {user && (
          <div className="space-y-2">
            <div><strong>User ID:</strong> {user.id}</div>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</div>
          </div>
        )}
        
        {profile && (
          <div className="space-y-2">
            <div><strong>Profile Name:</strong> {profile.full_name}</div>
            <div><strong>User Type:</strong> {profile.user_type}</div>
          </div>
        )}
        
        <Button onClick={testDatabaseConnection} variant="outline" size="sm">
          Test Database
        </Button>
      </CardContent>
    </Card>
  )
}