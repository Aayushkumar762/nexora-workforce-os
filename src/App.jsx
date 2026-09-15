import './App.css'
import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'

import { auth } from './firebase'
import Login from './Login'
import Dashboard from './Dashboard'

function App() {
const [user, setUser] = useState(null)
const [authLoading, setAuthLoading] = useState(true)

useEffect(() => {
const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
setUser(currentUser)
setAuthLoading(false)
})


return () => unsubscribe()


}, [])

const handleLogin = (loggedInUser) => {
setUser(loggedInUser)
}

const handleLogout = async () => {
try {
await signOut(auth)
setUser(null)
} catch (error) {
console.error('Logout Error:', error)
}
}

// Wait for Firebase to restore the existing login session
if (authLoading) {
return ( <main className="login-page"> <div className="login-background-glow login-glow-one" /> <div className="login-background-glow login-glow-two" />


    <section className="hero">
      <div className="hero-badge">
        <span>✦</span>
        NEXORA
      </div>

      <h1 className="hero-title">
        <span>Employee</span>
        <span>Management Hub</span>
      </h1>

      <p className="hero-subtitle">
        A modern workspace to manage your entire
        employee ecosystem.
      </p>

      <div
        style={{
          marginTop: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          opacity: 0.75,
        }}
      >
        <span>Restoring your session...</span>
      </div>
    </section>
  </main>
)


}

if (!user) {
return ( <main className="login-page"> <div className="login-background-glow login-glow-one" /> <div className="login-background-glow login-glow-two" />


    <section className="hero">
      <div className="hero-badge">
        <span>✦</span>
        NEXORA
      </div>

      <h1 className="hero-title">
        <span>Employee</span>
        <span>Management Hub</span>
      </h1>

      <p className="hero-subtitle">
        A modern workspace to manage your entire
        employee ecosystem.
      </p>
    </section>

    <Login onLogin={handleLogin} />
  </main>
)


}

return ( <div className="nexora-app"> <Dashboard
     user={user}
     onLogout={handleLogout}
   /> </div>
)
}

export default App
