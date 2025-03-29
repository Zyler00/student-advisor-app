import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Comment } from '../types'
import { supabase } from '../services/supabase'

export const useCommentStore = defineStore('comment', () => {
  const comments = ref<Comment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchComments = async (studentId: string) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: err } = await supabase
        .from('comments')
        .select('*')
        .eq('studentId', studentId)
        .order('createdAt', { ascending: false })
      
      if (err) {
        throw new Error('ไม่สามารถดึงข้อมูลความคิดเห็นได้: ' + err.message)
      }
      
      comments.value = data as Comment[]
      return data
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createComment = async (commentData: Partial<Comment>) => {
    try {
      loading.value = true
      error.value = null
      
      const newComment = {
        ...commentData,
        createdAt: new Date().toISOString()
      }
      
      const { data, error: err } = await supabase
        .from('comments')
        .insert([newComment])
        .select()
      
      if (err) {
        throw new Error('ไม่สามารถสร้างความคิดเห็นได้: ' + err.message)
      }
      
      if (data) {
        comments.value.unshift(data[0] as Comment)
      }
      
      return data
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteComment = async (commentId: string) => {
    try {
      loading.value = true
      error.value = null
      
      const { error: err } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
      
      if (err) {
        throw new Error('ไม่สามารถลบความคิดเห็นได้: ' + err.message)
      }

      comments.value = comments.value.filter(comment => comment.id !== commentId)
      
      return true
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    comments,
    loading,
    error,
    fetchComments,
    createComment,
    deleteComment
  }
})
