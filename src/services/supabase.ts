import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY
const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey || !serviceRoleKey) {
  console.error('Missing Supabase URL, Key, or Service Role Key in environment variables')
}

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key (first 10 chars):', supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'Not available')
console.log('Service Role Key (first 10 chars):', serviceRoleKey ? serviceRoleKey.substring(0, 10) + '...' : 'Not available')
console.log('Keys are different:', supabaseKey !== serviceRoleKey)

export const supabase = createClient(supabaseUrl, supabaseKey)
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

supabase.from('User').select('count').then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error for User table:', error)
    supabase.from('users').select('count').then(({ data: usersData, error: usersError }) => {
      if (usersError) {
        console.error('Supabase connection error for users table:', usersError)
      } else {
        console.log('Supabase connection successful, users table count:', usersData)
      }
    })
  } else {
    console.log('Supabase connection successful, User table count:', data)
  }
})

supabaseAdmin.from('User').select('count').then(({ data, error }) => {
  if (error) {
    console.error('Supabase Admin connection error for User table:', error)
    console.error('Error details:', error)
  } else {
    console.log('Supabase Admin connection successful, User table count:', data)
  }
})
