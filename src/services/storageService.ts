import { supabaseAdmin } from './supabase'

// บริการจัดการไฟล์ใน Supabase Storage
export const storageService = {
  // อัปโหลดรูปภาพโปรไฟล์
  async uploadProfileImage(file: File, userId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}.${fileExt}`
      // ไม่ใช้โฟลเดอร์ย่อย เพื่อให้ตรงกับ RLS Policies
      const filePath = fileName
      
      // ใช้ supabaseAdmin เพื่อข้าม RLS
      const { error } = await supabaseAdmin.storage
        .from('profile-images')
        .upload(filePath, file, {
          upsert: true // อัปเดตไฟล์ถ้ามีอยู่แล้ว
        })
      
      if (error) throw error
      
      // สร้าง public URL สำหรับรูปภาพ
      const { data: publicUrlData } = supabaseAdmin.storage
        .from('profile-images')
        .getPublicUrl(filePath)
      
      return publicUrlData.publicUrl
    } catch (error) {
      console.error('Error uploading profile image:', error)
      throw error
    }
  },

  // ลบรูปภาพโปรไฟล์
  async deleteProfileImage(userId: string): Promise<void> {
    try {
      // ใช้ supabaseAdmin เพื่อข้าม RLS
      const { data, error } = await supabaseAdmin.storage
        .from('profile-images')
        .list('', {
          search: userId
        })
      
      if (error) throw error
      
      if (data && data.length > 0) {
        const filesToDelete = data.map(file => file.name)
        
        const { error: deleteError } = await supabaseAdmin.storage
          .from('profile-images')
          .remove(filesToDelete)
        
        if (deleteError) throw deleteError
      }
    } catch (error) {
      console.error('Error deleting profile image:', error)
      throw error
    }
  },

  // อัปโหลดไฟล์เอกสาร
  async uploadDocument(file: File, folder: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${folder}/${fileName}`
      
      // ใช้ supabaseAdmin เพื่อข้าม RLS
      const { error } = await supabaseAdmin.storage
        .from('documents')
        .upload(filePath, file)
      
      if (error) throw error
      
      // สร้าง public URL สำหรับไฟล์
      const { data: publicUrlData } = supabaseAdmin.storage
        .from('documents')
        .getPublicUrl(filePath)
      
      return publicUrlData.publicUrl
    } catch (error) {
      console.error('Error uploading document:', error)
      throw error
    }
  },

  // ลบไฟล์เอกสาร
  async deleteDocument(filePath: string): Promise<void> {
    try {
      // ใช้ supabaseAdmin เพื่อข้าม RLS
      const { error } = await supabaseAdmin.storage
        .from('documents')
        .remove([filePath])
      
      if (error) throw error
    } catch (error) {
      console.error('Error deleting document:', error)
      throw error
    }
  }
}
