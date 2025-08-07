import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export const useCommunityLikes = () => {
  const { user } = useAuth()
  const [likedPosts, setLikedPosts] = useState<string[]>([])

  // Load user's liked posts when user changes
  useEffect(() => {
    if (user) {
      loadUserLikes()
    } else {
      setLikedPosts([])
    }
  }, [user])

  const loadUserLikes = async () => {
    if (!user) return

    try {
      // For now, we'll store liked posts in localStorage
      // In a real implementation, you'd have a separate likes table
      const storedLikes = localStorage.getItem(`user_likes_${user.id}`)
      if (storedLikes) {
        setLikedPosts(JSON.parse(storedLikes))
      }
    } catch (error) {
      console.error('Error loading user likes:', error)
    }
  }

  const toggleLike = async (postId: string) => {
    if (!user) return false

    const isLiked = likedPosts.includes(postId)
    let newLikedPosts: string[]

    if (isLiked) {
      newLikedPosts = likedPosts.filter(id => id !== postId)
    } else {
      newLikedPosts = [...likedPosts, postId]
    }

    setLikedPosts(newLikedPosts)
    
    // Store in localStorage
    localStorage.setItem(`user_likes_${user.id}`, JSON.stringify(newLikedPosts))

    try {
      // Update the post's like count in the database
      const { data: currentPost } = await supabase
        .from('community_posts')
        .select('likes_count')
        .eq('id', postId)
        .single()

      const newLikesCount = (currentPost?.likes_count || 0) + (isLiked ? -1 : 1)

      const { error } = await supabase
        .from('community_posts')
        .update({ likes_count: Math.max(0, newLikesCount) })
        .eq('id', postId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating likes:', error)
      // Revert the local state on error
      setLikedPosts(likedPosts)
      localStorage.setItem(`user_likes_${user.id}`, JSON.stringify(likedPosts))
      return false
    }
  }

  const isLiked = (postId: string) => likedPosts.includes(postId)

  return {
    likedPosts,
    toggleLike,
    isLiked
  }
}