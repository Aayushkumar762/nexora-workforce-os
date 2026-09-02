import { useRef } from 'react'

import {
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth'

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'

import { auth, db } from './firebase'

function Login({ onLogin }) {
  const loginInProgress = useRef(false)

  const handleGoogleLogin = async () => {
    if (loginInProgress.current) {
      return
    }

    loginInProgress.current = true

    try {
      const provider =
        new GoogleAuthProvider()

      const result =
        await signInWithPopup(
          auth,
          provider
        )

      const loggedInUser =
        result.user

      console.log(
        'Logged in user:',
        loggedInUser
      )

      const userRef = doc(
        db,
        'users',
        loggedInUser.uid
      )

      const userSnapshot =
        await getDoc(userRef)

      if (!userSnapshot.exists()) {
        await setDoc(userRef, {
          uid:
            loggedInUser.uid,

          name:
            loggedInUser.displayName || '',

          email:
            loggedInUser.email || '',

          photoURL:
            loggedInUser.photoURL || '',

          role:
            'employee',

          companyId:
            null,

          createdAt:
            serverTimestamp(),
        })

        console.log(
          'New user profile created.'
        )
      } else {
        await setDoc(
          userRef,
          {
            uid:
              loggedInUser.uid,

            name:
              loggedInUser.displayName || '',

            email:
              loggedInUser.email || '',

            photoURL:
              loggedInUser.photoURL || '',
          },
          {
            merge: true,
          }
        )

        console.log(
          'Existing user profile found.'
        )
      }

      onLogin(loggedInUser)

    } catch (error) {
      console.error(
        'Google Login Error:',
        error
      )

      if (
        error.code ===
          'auth/cancelled-popup-request' ||
        error.code ===
          'auth/popup-closed-by-user'
      ) {
        return
      }

      if (
        error.code ===
        'auth/popup-blocked'
      ) {
        alert(
          'Google Login popup was blocked.\n\nPlease allow popups for localhost and try again.'
        )

        return
      }

      alert(
        `Google Login Failed\n\nCode: ${error.code}\nMessage: ${error.message}`
      )

    } finally {
      loginInProgress.current = false
    }
  }

  return (
    <div className="login-card">

      <div className="login-icon">
        🔐
      </div>

      <div className="login-badge">
        SECURE ACCESS
      </div>

      <h2>
        Welcome to Nexora
      </h2>

      <p>
        Sign in to access your Employee
        Management Platform.
      </p>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="google-login-button"
      >
        <span className="google-icon">
          G
        </span>

        Continue with Google
      </button>

      <div className="login-security">
        🔒 Secure authentication powered by
        Firebase
      </div>

    </div>
  )
}

export default Login