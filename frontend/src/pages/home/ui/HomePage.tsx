/**
 * Home Page - Main page with user list
 */

import React from 'react'
import { UserListWidget } from '@/widgets/user-list'
import { useUserStore } from '@/entities/user/model'
import { getUserDisplayName } from '@/shared/lib/utils'

export const HomePage: React.FC = () => {
  const currentUser = useUserStore((state) => state.currentUser)

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
      }}
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: '#fff',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '24px' }}>Telegram Calls</h1>

          {currentUser && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              {currentUser.photo_url ? (
                <img
                  src={currentUser.photo_url}
                  alt={currentUser.first_name}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#4CAF50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                >
                  {currentUser.first_name[0]}
                </div>
              )}
              <span style={{ fontWeight: 500 }}>
                {getUserDisplayName(currentUser)}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main>
        <UserListWidget />
      </main>
    </div>
  )
}
