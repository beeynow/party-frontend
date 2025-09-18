import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { getAuthToken, removeAuthToken } from '../lib/auth-storage'

export default function IndexPage() {
  const router = useRouter()

  useEffect(() => {
    const checkToken = async () => {
      const token = await getAuthToken()
      if (token) {
        router.replace('/(tabs)/overview') // or your home page
      } else {
        router.replace('/login')
      }
    }

    checkToken()
  }, [])

  return null
}
