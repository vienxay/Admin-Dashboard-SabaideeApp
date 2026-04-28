import { useState, useCallback } from 'react'
import { getUsers, updateRole, deleteUser } from '../services/api'

export function useUsers() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getUsers()
      setUsers(res.data.data || [])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleRoleChange = async (userId, role) => {
    await updateRole(userId, role)
    fetchUsers()
  }

  const handleDelete = async (userId) => {
    await deleteUser(userId)
    fetchUsers()
  }

  return { users, loading, fetchUsers, handleRoleChange, handleDelete }
}