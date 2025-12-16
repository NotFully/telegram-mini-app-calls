/**
 * User List Widget - Display online users
 */

import React, { useEffect } from 'react'
import { useUserStore } from '@/entities/user/model'
import { usersApi } from '@/shared/api'
import { StartCallButton } from '@/features/call/start-call'
import { getUserDisplayName } from '@/shared/lib/utils'

export const UserListWidget: React.FC = () => {
  const { onlineUsers, currentUser, setOnlineUsers, setLoading, setError } =
    useUserStore()

  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        setLoading(true)
        const users = await usersApi.listOnlineUsers()
        // Filter out current user
        const filteredUsers = users.filter(
          (user) => user.id !== currentUser?.id
        )
        setOnlineUsers(filteredUsers)
      } catch (error) {
        console.error('Failed to fetch online users:', error)
        setError('Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    fetchOnlineUsers()

    // Refresh every 10 seconds
    const interval = setInterval(fetchOnlineUsers, 10000)

    return () => clearInterval(interval)
  }, [currentUser, setOnlineUsers, setLoading, setError])

  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>
        Online Users
      </h2>

      {onlineUsers.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666',
          }}
        >
          No users online at the moment
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
          }}
        >
          {onlineUsers.map((user) => (
            <div
              key={user.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '15px',
                backgroundColor: '#f5f5f5',
                borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {user.photo_url ? (
                  <img
                    src={user.photo_url}
                    alt={user.first_name}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      backgroundColor: '#4CAF50',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '20px',
                      fontWeight: 'bold',
                    }}
                  >
                    {user.first_name[0]}
                  </div>
                )}

                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {user.first_name} {user.last_name || ''}
                  </div>
                  {user.username && (
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      @{user.username}
                    </div>
                  )}
                </div>
              </div>

              <StartCallButton
                targetUserId={user.id}
                targetUserName={getUserDisplayName(user)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
