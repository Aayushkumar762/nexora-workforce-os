import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  getDocs,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'

import { db, storage } from './firebase'
import {
  deleteObject,
  ref,
} from 'firebase/storage'

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  joiningDate: '',
  status: 'Active',
}

function Dashboard({ user, onLogout }) {
  const [employees, setEmployees] = useState([])

  const [userRole, setUserRole] = useState(null)
  

  const [loadingProfile, setLoadingProfile] = useState(true)

const [loadingRole, setLoadingRole] = useState(true)

  const [showModal, setShowModal] =
    useState(false)

  const [showDetails, setShowDetails] =
    useState(false)

    const [userProfile, setUserProfile] = useState(null)

    const [loadingEmployeeDetails, setLoadingEmployeeDetails] = useState(true)
    const [loadingEmployees, setLoadingEmployees] = useState(false)

  const [saving, setSaving] =
    useState(false)



  const [editingEmployee, setEditingEmployee] =
    useState(null)

  const [selectedEmployee, setSelectedEmployee] =
    useState(null)

  const [searchTerm, setSearchTerm] =
    useState('')

const [notifications, setNotifications] =
  useState([])

const [activities, setActivities] = useState([])

const [loadingLeaves, setLoadingLeaves] = useState(true)

const [leaveRequests, setLeaveRequests] = useState([])

const [selectedLeave, setSelectedLeave] = useState(null)

const [showNotifications, setShowNotifications] =
  useState(false)

  const [departmentFilter, setDepartmentFilter] =
    useState('All')

  const [statusFilter, setStatusFilter] =
    useState('All')

  const [theme, setTheme] = useState(() => {
    return (
      localStorage.getItem('nexora-theme') ||
      'dark'
    )
  })
  

  const [form, setForm] =
    useState(INITIAL_FORM)


  /* =====================================================
     THEME
  ===================================================== */

  useEffect(() => {
    document.body.classList.toggle(
      'light-theme',
      theme === 'light'
    )

    localStorage.setItem(
      'nexora-theme',
      theme
    )

    return () => {
      document.body.classList.remove(
        'light-theme'
      )
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === 'dark'
        ? 'light'
        : 'dark'
    )
  }
  const notificationsKey = user?.uid
  ? `nexora-notifications-${user.uid}`
  : null

useEffect(() => {
  if (!notificationsKey) {
    setNotifications([])
    return
  }

  try {
    const savedNotifications =
      localStorage.getItem(
        notificationsKey
      )

    setNotifications(
      savedNotifications
        ? JSON.parse(savedNotifications)
        : []
    )
  } catch (error) {
    console.error(
      'Notification Load Error:',
      error
    )

    setNotifications([])
  }
}, [notificationsKey])

const saveNotifications = (
  nextNotifications
) => {
  setNotifications(nextNotifications)

  if (notificationsKey) {
    localStorage.setItem(
      notificationsKey,
      JSON.stringify(nextNotifications)
    )
  }
}
const addNotification = ({
  title,
  message,
  type = 'info',
}) => {
  const notification = {
    id: `${Date.now()}-${Math.random()}`,
    title,
    message,
    type,
    createdAt: Date.now(),
    read: false,
  }

  const nextNotifications = [
    notification,
    ...notifications,
  ].slice(0, 30)

  saveNotifications(nextNotifications)
}

const markNotificationAsRead = (
  notificationId
) => {
  const nextNotifications =
    notifications.map(
      (notification) =>
        notification.id ===
        notificationId
          ? {
              ...notification,
              read: true,
            }
          : notification
    )

  saveNotifications(nextNotifications)
}

const markAllNotificationsAsRead =
  () => {
    const nextNotifications =
      notifications.map(
        (notification) => ({
          ...notification,
          read: true,
        })
      )

    saveNotifications(
      nextNotifications
    )
  }

const clearNotifications = () => {
  saveNotifications([])
}

const unreadNotifications =
  notifications.filter(
    (notification) =>
      !notification.read
  ).length
const activitiesKey = user?.uid
  ? `nexora-activities-${user.uid}`
  : null

useEffect(() => {
  if (!activitiesKey) {
    setActivities([])
    return
  }

  try {
    const savedActivities =
      localStorage.getItem(
        activitiesKey
      )

    setActivities(
      savedActivities
        ? JSON.parse(savedActivities)
        : []
    )
  } catch (error) {
    console.error(
      'Activity Load Error:',
      error
    )

    setActivities([])
  }
}, [activitiesKey])

const saveActivities = (
  nextActivities
) => {
  setActivities(nextActivities)

  if (activitiesKey) {
    localStorage.setItem(
      activitiesKey,
      JSON.stringify(nextActivities)
    )
  }
}

const addActivity = ({
  title,
  message,
  type = 'info',
}) => {
  const activity = {
    id: `${Date.now()}-${Math.random()}`,
    title,
    message,
    type,
    createdAt: Date.now(),
  }

  const nextActivities = [
    activity,
    ...activities,
  ].slice(0, 20)

  saveActivities(
    nextActivities
  )
}
 const [toast, setToast] = useState(null)
 const showToast = ({
  message,
  type = 'info',
}) => {
  setToast({
    id: Date.now(),
    message,
    type,
  })

  setTimeout(() => {
    setToast(null)
  }, 3500)
}
/* =====================================================
   LOAD USER ROLE
===================================================== */

useEffect(() => {
  const loadUserRole = async () => {
    if (!user?.uid) {
      setUserRole(null)
      setLoadingRole(false)
      return
    }

    try {
      setLoadingRole(true)

      const userRef = doc(
        db,
        'users',
        user.uid
      )

      const userSnapshot =
        await getDoc(userRef)

      if (userSnapshot.exists()) {
        const userData =
          userSnapshot.data()

        setUserRole(
          userData.role || 'employee'
        )
      } else {
        console.warn(
          'User document not found.'
        )

        setUserRole('employee')
      }
    } catch (error) {
      console.error(
        'User Role Load Error:',
        error
      )

      setUserRole(null)
    } finally {
      setLoadingRole(false)
    }
  }

  loadUserRole()
}, [user?.uid])

/* =====================================================
   LOAD USER PROFILE / ROLE
===================================================== */

useEffect(() => {
  if (!user?.uid) {
    
    return
  }
  const userRef = doc(
    db,
    'users',
    user.uid
  )

  const unsubscribe = onSnapshot(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        setUserProfile(snapshot.data())
      } else {
        setUserProfile(null)
      }

      setLoadingProfile(false)
    },
    (error) => {
      console.error(
        'User Profile Error:',
        error
      )

      setUserProfile(null)
      setLoadingProfile(false)
    }
  )

  return () => unsubscribe()
}, [user?.uid])

const role = userProfile?.role

const companyId = userProfile?.companyId

const isEmployee = role === 'employee'
const isAdmin =
  role === 'admin' ||
  role === 'superadmin' ||
  role === 'super_admin'
console.log('ROLE:', role)
console.log('USER PROFILE:', userProfile)

  /* =====================================================
     LOAD EMPLOYEES
  ===================================================== */

  useEffect(() => {
    if (!user?.uid) {
      setEmployees([])
      setLoadingEmployees(false)
      return
    }

    setLoadingEmployees(true)

    const employeesRef = collection(
      db,
      'employees'
    )

    const employeesQuery = query(
      employeesRef,
      where(
        'ownerId',
        '==',
        user.uid
      )
    )

    const unsubscribe = onSnapshot(
      employeesQuery,
      (snapshot) => {
        const employeeData =
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))

        employeeData.sort((a, b) => {
          const aTime =
            a.createdAt?.seconds || 0

          const bTime =
            b.createdAt?.seconds || 0

          return bTime - aTime
        })

        setEmployees(employeeData)
        setLoadingEmployees(false)
      },
      (error) => {
        console.error(
          'Firestore Error:',
          error
        )

        setEmployees([])
        setLoadingEmployees(false)

        if (
          error.code ===
          'permission-denied'
        ) {
        showToast({
  message:
    'Firestore permission denied. Please check your Firestore Security Rules.',
  type: 'error',
})
        }
      }
    )

    return () => unsubscribe()
  }, [user?.uid])


/* =====================================================
   ADMIN - LOAD PENDING LEAVE REQUESTS
===================================================== */

useEffect(() => {
  // Employee ke liye admin leave listener mat chalao
  if (!user?.uid || !isAdmin) {
    setLeaveRequests([])
    setLoadingLeaves(false)
    return
  }

  setLoadingLeaves(true)

  const leaveQuery = query(
    collection(db, 'leaveRequests'),
    where('status', '==', 'Pending')
  )

  const unsubscribe = onSnapshot(
    leaveQuery,
    (snapshot) => {
      const requests = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }))

      setLeaveRequests(requests)
      setLoadingLeaves(false)
    },
    (error) => {
      console.error(
        'ADMIN LEAVE LOAD ERROR:',
        error
      )

      setLeaveRequests([])
      setLoadingLeaves(false)
    }
  )

  return () => unsubscribe()
}, [user?.uid, isAdmin])

/* =====================================================
   APPROVE / REJECT LEAVE REQUEST
===================================================== */

const updateLeaveStatus = async (
  leaveId,
  newStatus
) => {
  if (!leaveId) {
    return
  }

  try {
    const leaveRef = doc(
      db,
      'leaveRequests',
      leaveId
    )

    await updateDoc(leaveRef, {
      status: newStatus,
      reviewedAt: serverTimestamp(),
      reviewedBy: user?.uid || null,
    })

    // Update currently opened modal immediately
    setSelectedLeave((currentLeave) => {
      if (!currentLeave) {
        return null
      }

      return {
        ...currentLeave,
        status: newStatus,
      }
    })

    // Activity
    addActivity({
      title:
        newStatus === 'Approved'
          ? 'Leave Request Approved'
          : 'Leave Request Rejected',

      message:
        newStatus === 'Approved'
          ? 'An employee leave request was approved.'
          : 'An employee leave request was rejected.',

      type:
        newStatus === 'Approved'
          ? 'success'
          : 'warning',
    })

    // Notification
    addNotification({
      title:
        newStatus === 'Approved'
          ? 'Leave Approved'
          : 'Leave Rejected',

      message:
        newStatus === 'Approved'
          ? 'An employee leave request has been approved.'
          : 'An employee leave request has been rejected.',

      type:
        newStatus === 'Approved'
          ? 'success'
          : 'warning',
    })

    showToast({
      message:
        newStatus === 'Approved'
          ? 'Leave request approved successfully.'
          : 'Leave request rejected successfully.',
      type:
        newStatus === 'Approved'
          ? 'success'
          : 'error',
    })
  } catch (error) {
    console.error(
      'UPDATE LEAVE STATUS ERROR:',
      error
    )

    showToast({
      message:
        'Unable to update leave request. Please try again.',
      type: 'error',
    })
  }
}
  /* =====================================================
     FORM
  ===================================================== */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const resetForm = () => {
    setForm({
      ...INITIAL_FORM,
    })

    setEditingEmployee(null)
  }

  /* =====================================================
     ADD
  ===================================================== */

  const openAddModal = () => {
    resetForm()
    setShowModal(true)
  }

  /* =====================================================
     EDIT
  ===================================================== */

  const openEditModal = (
    employee
  ) => {
    setEditingEmployee(employee)

    setForm({
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      department:
        employee.department || '',
      position:
        employee.position || '',
      joiningDate:
        employee.joiningDate || '',
      status:
        employee.status || 'Active',
    })

    setShowModal(true)
  }

  /* =====================================================
     DETAILS
  ===================================================== */

  const openDetails = (
    employee
  ) => {
    setSelectedEmployee(employee)
    setShowDetails(true)
  }

  const closeDetails = () => {
    setShowDetails(false)
    setSelectedEmployee(null)
  }

  /* =====================================================
     MODAL
  ===================================================== */

  const closeModal = () => {
    if (saving) return

    setShowModal(false)
    resetForm()
  }

  /* =====================================================
     SAVE EMPLOYEE
  ===================================================== */
const handleSaveEmployee = async (event) => {
  event.preventDefault()

  const name = form.name.trim()
  const email = form.email.trim()

  if (!name || !email) {
    showToast({
  message: 'Please enter employee name and email.',
  type: 'error',
})
    return
  }

  if (!user?.uid) {
   showToast({
  message: 'Your login session has expired. Please login again.',
  type: 'error',
})
    return
  }

  try {
    setSaving(true)

    if (editingEmployee) {
      // ==============================
      // UPDATE EXISTING EMPLOYEE
      // ==============================

      const employeeRef = doc(
        db,
        'employees',
        editingEmployee.id
      )

     await updateDoc(employeeRef, {
  name,
  email,
  phone: form.phone.trim(),
  department: form.department.trim(),
  position: form.position.trim(),
  joiningDate: form.joiningDate,
  status: form.status,

  companyId:
    userProfile?.companyId || 'nexora',

  updatedAt:
    serverTimestamp(),
})

      // Notification
      addNotification({
        title: 'Employee Updated',
        message: `${name}'s employee information has been updated.`,
        type: 'info',
      })
      

    } else {
      // ==============================
      // ADD NEW EMPLOYEE
      // ==============================

      await addDoc(
        collection(db, 'employees'),
        {
          name,
          email,
          phone: form.phone.trim(),
          department: form.department.trim(),
          position: form.position.trim(),
          joiningDate: form.joiningDate,
          status: form.status,
          ownerId: user.uid,
          createdAt: serverTimestamp(),
        }
      )

      // Notification
      addNotification({
        title: 'Employee Added',
        message: `${name} has been added to your employee directory.`,
        type: 'success',
      })
    }

    // Close modal
    setShowModal(false)

    // Clear form
    resetForm()

  } catch (error) {
    console.error(
      'Save Employee Error:',
      error
    )

   showToast({
  message: `Employee save nahi hua. Code: ${
    error.code || 'unknown'
  }. ${
    error.message ||
    'Something went wrong.'
  }`,
  type: 'error',
})
  } finally {
    setSaving(false)
  }
}
  const handleDeleteEmployee = async (employeeId) => {
  if (!user?.uid) {
    showToast({
      message: 'Your login session has expired. Please login again.',
      type: 'error',
    })
    return
  }

  if (!isAdmin) {
    showToast({
      message: 'Only Admin can delete employees.',
      type: 'error',
    })
    return
  }

  const confirmed = window.confirm(
    'Are you sure you want to delete this employee?'
  )

  if (!confirmed) return

  try {
    await deleteDoc(
      doc(db, 'employees', employeeId)
    )

    addNotification({
      title: 'Employee Deleted',
      message: 'Employee has been removed from the directory.',
      type: 'info',
    })

    showToast({
      message: 'Employee deleted successfully.',
      type: 'success',
    })
  } catch (error) {
    console.error('Delete Employee Error:', error)

    showToast({
      message: `Employee delete nahi hua. Code: ${
        error.code || 'unknown'
      }. ${
        error.message ||
        'Something went wrong.'
      }`,
      type: 'error',
    })
  }
}
  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalEmployees =
    employees.length

  const activeEmployees =
    employees.filter(
      (employee) =>
        employee.status === 'Active'
    ).length

  const inactiveEmployees =
    totalEmployees -
    activeEmployees

  const departments =
    new Set(
      employees
        .map(
          (employee) =>
            employee.department?.trim()
        )
        .filter(Boolean)
    ).size

  /* =====================================================
     DEPARTMENT OPTIONS
  ===================================================== */

  const departmentOptions =
    useMemo(() => {
      return [
        ...new Set(
          employees
            .map(
              (employee) =>
                employee.department?.trim()
            )
            .filter(Boolean)
        ),
      ].sort()
    }, [employees])

  /* =====================================================
     FILTERED EMPLOYEES
  ===================================================== */

  const filteredEmployees =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase()

      return employees.filter(
        (employee) => {
          const matchesSearch =
            !search ||
            employee.name
              ?.toLowerCase()
              .includes(search) ||
            employee.email
              ?.toLowerCase()
              .includes(search) ||
            employee.phone
              ?.toLowerCase()
              .includes(search) ||
            employee.department
              ?.toLowerCase()
              .includes(search) ||
            employee.position
              ?.toLowerCase()
              .includes(search)

          const matchesDepartment =
            departmentFilter ===
              'All' ||
            employee.department ===
              departmentFilter

          const matchesStatus =
            statusFilter === 'All' ||
            employee.status ===
              statusFilter

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesStatus
          )
        }
      )
    }, [
      employees,
      searchTerm,
      departmentFilter,
      statusFilter,
    ])

  /* =====================================================
     DEPARTMENT ANALYTICS
  ===================================================== */

  const departmentStats =
    useMemo(() => {
      const counts = {}

      employees.forEach(
        (employee) => {
          const department =
            employee.department?.trim() ||
            'Other'

          counts[department] =
            (counts[department] || 0) +
            1
        }
      )

      return Object.entries(
        counts
      )
        .sort(
          (a, b) =>
            b[1] - a[1]
        )
        .slice(0, 6)
    }, [employees])

  const maxDepartmentCount =
    Math.max(
      ...departmentStats.map(
        ([, count]) => count
      ),
      1
    )

  /* =====================================================
     USER
  ===================================================== */
 
const displayName =
  user?.displayName ||
  user?.email?.split('@')[0] ||
  'Employee'

const email =
  user?.email ||
  'No email available'

const ADMIN_UID =
  'MMOgE6jMVCgTGzrwHRCvAx543rj2'

const avatarLetter =
  displayName
    .charAt(0)
    .toUpperCase()
  /* =====================================================
     DATE
  ===================================================== */

  const formatDate = (
    date
  ) => {
    if (!date) {
      return 'Not provided'
    }

    try {
      const parsedDate =
        new Date(date)

      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {
        return date
      }

      return parsedDate.toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }
      )
    } catch {
      return date
    }
  }

  /* =====================================================
     RESET FILTERS
  ===================================================== */

  const resetFilters = () => {
    setSearchTerm('')
    setDepartmentFilter('All')
    setStatusFilter('All')
  }

  /* =====================================================
   EMPLOYEE / ADMIN RENDER
===================================================== */

if (loadingProfile) {
  return (
    <div className="dashboard-loading">
      Loading...
    </div>
  )
}
if (isEmployee) {
  return (
    <EmployeeDashboard
      user={user}
      userProfile={userProfile}
      employees={employees}
      onLogout={onLogout}
      theme={theme}
      toggleTheme={toggleTheme}
    />
  )
}

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="nexora-app">
{toast && (
      <div
        className={`toast toast-${toast.type}`}
        role="alert"
      >
        <span className="toast-icon">
          {toast.type === 'success'
            ? '✓'
            : toast.type === 'error'
              ? '!'
              : 'i'}
        </span>

        <span className="toast-message">
          {toast.message}
        </span>

        <button
          type="button"
          className="toast-close"
          onClick={() => setToast(null)}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    )}

      {/* =================================================
          TOPBAR
      ================================================= */}

      <header className="topbar">

        <div className="brand">

          <div className="brand-mark">
            ✦
          </div>

          <div>
            <strong>
              NEXORA
            </strong>

            <span>
              WORKFORCE OS
            </span>
          </div>

        </div>
        <div className="topbar-actions">
<div className="notification-wrapper">

  <button
    type="button"
    className="icon-button notification-button"
    onClick={() =>
      setShowNotifications(
        (current) => !current
      )
    }
    title="Notifications"
  >
    🔔

    {unreadNotifications > 0 && (
      <span className="notification-count">
        {unreadNotifications > 9
          ? '9+'
          : unreadNotifications}
      </span>
    )}
  </button>

 {showNotifications && (
  <div
    className="notification-panel"
    onMouseLeave={() =>
      setShowNotifications(false)
    }
  >

      <div className="notification-header">

        <div>
          <strong>
            Notifications
          </strong>

          <span>
            {unreadNotifications > 0
              ? `${unreadNotifications} unread`
              : 'All caught up'}
          </span>
        </div>

        {notifications.length > 0 && (
          <button
            type="button"
            className="notification-clear"
            onClick={
              clearNotifications
            }
          >
            Clear all
          </button>
        )}

      </div>

      {notifications.length === 0 ? (
        <div className="notification-empty">

          <div>
            🔔
          </div>

          <strong>
            No notifications
          </strong>

          <span>
            Employee activity will
            appear here.
          </span>

        </div>
      ) : (
        <>

          <div className="notification-list">

            {notifications.map(
              (notification) => (
                <button
                  type="button"
                  className={`notification-item ${
                    notification.read
                      ? ''
                      : 'unread'
                  }`}
                  key={
                    notification.id
                  }
                  onClick={() =>
                    markNotificationAsRead(
                      notification.id
                    )
                  }
                >

                  <span
                    className={`notification-type ${notification.type}`}
                  >
                    {notification.type ===
                    'success'
                      ? '✓'
                      : notification.type ===
                        'danger'
                        ? '!'
                        : 'i'}
                  </span>

                  <span className="notification-content">

                    <strong>
                      {
                        notification.title
                      }
                    </strong>

                    <span>
                      {
                        notification.message
                      }
                    </span>

                    <small>
                      {new Date(
                        notification.createdAt
                      ).toLocaleString(
                        'en-IN',
                        {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute:
                            '2-digit',
                        }
                      )}
                    </small>

                  </span>

                  {!notification.read && (
                    <span className="notification-unread-dot"></span>
                  )}

                </button>
              )
            )}

          </div>

          {unreadNotifications >
            0 && (
            <button
              type="button"
              className="mark-all-read"
              onClick={
                markAllNotificationsAsRead
              }
            >
              ✓ Mark all as read
            </button>
          )}

        </>
      )}

    </div>
  )}

</div>

          <div className="nav-divider"></div>

          <div className="mini-profile">

            <div className="mini-avatar">

              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      'none'
                  }}
                />
              ) : (
                avatarLetter
              )}

            </div>

            <div className="mini-profile-text">

              <strong>
                {displayName}
              </strong>

              <span>
                Online
              </span>

            </div>

          </div>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <style>{`
  .dashboard-shell.dark-admin-mode .admin-leave-section {
    background: linear-gradient(145deg, #11142a 0%, #0c0f21 55%, #090b18 100%) !important;
    color: #f5f7ff !important;
    border: 1px solid rgba(139, 92, 246, 0.22) !important;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.34) !important;
  }

  .dashboard-shell.dark-admin-mode .admin-leave-section h2,
  .dashboard-shell.dark-admin-mode .admin-leave-section h3,
  .dashboard-shell.dark-admin-mode .admin-leave-section strong {
    color: #f7f8ff !important;
  }

  .dashboard-shell.dark-admin-mode .admin-leave-section p,
  .dashboard-shell.dark-admin-mode .admin-leave-section .page-eyebrow,
  .dashboard-shell.dark-admin-mode .admin-leave-section .leave-row-employee-info span,
  .dashboard-shell.dark-admin-mode .admin-leave-section .leave-row-date,
  .dashboard-shell.dark-admin-mode .admin-leave-section .leave-row-days span,
  .dashboard-shell.dark-admin-mode .admin-leave-section .leave-folder-footer {
    color: #aeb5d1 !important;
  }

  .dashboard-shell.dark-admin-mode .admin-leave-header {
    background: transparent !important;
  }

  .dashboard-shell.dark-admin-mode .admin-leave-main-icon {
    background: rgba(139, 92, 246, 0.14) !important;
    border: 1px solid rgba(139, 92, 246, 0.28) !important;
  }

  .dashboard-shell.dark-admin-mode .leave-request-count {
    background: rgba(245, 158, 11, 0.08) !important;
    border: 1px solid rgba(245, 158, 11, 0.25) !important;
    color: #fbbf24 !important;
  }

  .dashboard-shell.dark-admin-mode .leave-request-count strong,
  .dashboard-shell.dark-admin-mode .leave-request-count span {
    color: #fbbf24 !important;
  }

  .dashboard-shell.dark-admin-mode .leave-request-folder {
    background: transparent !important;
  }

  .dashboard-shell.dark-admin-mode .leave-request-row {
    background: linear-gradient(135deg, #171a33 0%, #11142a 100%) !important;
    color: #f7f8ff !important;
    border: 1px solid rgba(148, 163, 184, 0.14) !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18) !important;
  }

  .dashboard-shell.dark-admin-mode .leave-request-row:hover {
    background: linear-gradient(135deg, #1d2140 0%, #151934 100%) !important;
    border-color: rgba(139, 92, 246, 0.38) !important;
    transform: translateY(-1px);
  }

  .dashboard-shell.dark-admin-mode .leave-row-employee-info strong,
  .dashboard-shell.dark-admin-mode .leave-row-type,
  .dashboard-shell.dark-admin-mode .leave-row-days strong {
    color: #f7f8ff !important;
  }

  .dashboard-shell.dark-admin-mode .leave-row-avatar {
    background: linear-gradient(135deg, #7c3aed, #a855f7) !important;
    color: #fff !important;
  }

  .dashboard-shell.dark-admin-mode .leave-status {
    background: rgba(245, 158, 11, 0.10) !important;
    border-color: rgba(245, 158, 11, 0.30) !important;
    color: #fbbf24 !important;
  }

  .dashboard-shell.dark-admin-mode .leave-row-arrow {
    color: #a78bfa !important;
  }

  .dashboard-shell.dark-admin-mode .leave-folder-footer strong {
    color: #e9eaff !important;
  }

  .dashboard-shell.dark-admin-mode .admin-leave-empty {
    background: transparent !important;
    color: #f7f8ff !important;
  }
`}</style>

<main className={`dashboard-shell ${theme === 'dark' ? 'dark-admin-mode' : 'light-admin-mode'}`}>

        {/* HERO */}

        <section className="dashboard-hero">

          <div>

            <div className="eyebrow">
              <span className="eyebrow-dot"></span>
              NEXORA EMPLOYEE HUB
            </div>

            <h1>
              <span>
                Welcome, {displayName}
              </span>

              <span className="wave">
                👋
              </span>
            </h1>

            <p>
              Manage your employees from
              one powerful workspace.
              Track your workforce,
              departments and employee
              activity in one place.
            </p>

          </div>

          <div className="hero-actions">
<button
  type="button"
  className={`premium-theme-toggle ${
    theme === 'light' ? 'is-light' : 'is-dark'
  }`}
  onClick={toggleTheme}
  title={
    theme === 'dark'
      ? 'Switch to Light Mode'
      : 'Switch to Dark Mode'
  }
  aria-label={
    theme === 'dark'
      ? 'Switch to Light Mode'
      : 'Switch to Dark Mode'
  }
>
  <span className="theme-icon">
    {theme === 'dark' ? '🌙' : '☀️'}
  </span>

  <span className="theme-toggle-text">
    {theme === 'dark' ? 'Dark' : 'Light'}
  </span>

  <span className="theme-status-dot"></span>
</button>
            {isAdmin && (
  <button
    type="button"
    className="primary-button"
    onClick={openAddModal}
  >
    ＋ Add Employee
  </button>
)}
          </div>

        </section>

        {/* ACCOUNT */}

        <section className="account-strip">

          <div className="account-avatar">

            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                onError={(event) => {
                  event.currentTarget.style.display =
                    'none'
                }}
              />
            ) : (
              avatarLetter
            )}

            <i></i>

          </div>

          <div className="account-info">

            <span className="account-label">
              SIGNED IN ACCOUNT
            </span>

            <h2>
              {displayName}
            </h2>

            <p>
              ✉ {email}
            </p>

          </div>

          <div className="account-status">
            <span className="status-dot active"></span>
            Google Account • Online
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={onLogout}
          >
            ↪ Logout
          </button>

        </section>

        {/* STATS */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-top">

              <div className="stat-icon">
                👥
              </div>

              <span className="stat-trend neutral">
                ALL
              </span>

            </div>

            <span className="stat-title">
              Total Employees
            </span>

            <strong>
              {totalEmployees}
            </strong>

            <small>
              All employees
            </small>

          </div>

          <div className="stat-card stat-green">

            <div className="stat-top">

              <div className="stat-icon">
                ●
              </div>

              <span className="stat-trend positive">
                LIVE
              </span>

            </div>

            <span className="stat-title">
              Active Employees
            </span>

            <strong>
              {activeEmployees}
            </strong>

            <small>
              Currently active
            </small>

          </div>

          <div className="stat-card stat-blue">

            <div className="stat-top">

              <div className="stat-icon">
                🏢
              </div>

              <span className="stat-trend neutral">
                ORG
              </span>

            </div>

            <span className="stat-title">
              Departments
            </span>

            <strong>
              {departments}
            </strong>

            <small>
              Across organization
            </small>

          </div>

          <div className="stat-card stat-orange">

            <div className="stat-top">

              <div className="stat-icon">
                ⚡
              </div>

              <span className="stat-trend positive">
                100%
              </span>

            </div>

            <span className="stat-title">
              System Status
            </span>

            <strong className="live-value">
              Live
            </strong>

            <small>
              Everything is running
            </small>

          </div>

        </section>

        {/* ANALYTICS */}

        <section className="analytics-grid">

          {/* DEPARTMENT */}

          <div className="analytics-card">

            <div className="analytics-header">

              <div>

                <span className="analytics-label">
                  ANALYTICS
                </span>

                <h2>
                  Department Overview
                </h2>

                <p>
                  Employee distribution
                  across departments
                </p>

              </div>

              <div className="analytics-icon">
                📊
              </div>

            </div>

            {departmentStats.length ===
            0 ? (
              <div className="chart-empty">
                Add employees to see
                analytics.
              </div>
            ) : (
              <div className="bar-chart">

                {departmentStats.map(
                  ([department, count]) => {
                    const width =
                      (count /
                        maxDepartmentCount) *
                      100

                    return (
                      <div
                        className="bar-item"
                        key={department}
                      >

                        <div className="bar-meta">

                          <span>
                            {department}
                          </span>

                          <strong>
                            {count}
                          </strong>

                        </div>

                        <div className="bar-track">

                          <div
                            className="bar-fill"
                            style={{
                              width: `${width}%`,
                            }}
                          />

                        </div>

                      </div>
                    )
                  }
                )}

              </div>
            )}

          </div>

          {/* STATUS */}

          <div className="analytics-card">

            <div className="analytics-header">

              <div>

                <span className="analytics-label">
                  WORKFORCE
                </span>

                <h2>
                  Employee Status
                </h2>

                <p>
                  Current workforce health
                </p>

              </div>

              <div className="analytics-icon green">
                ⚡
              </div>

            </div>

            <div className="status-chart">

              <div
                className="donut"
                style={{
                  '--progress':
                    totalEmployees
                      ? `${
                          (activeEmployees /
                            totalEmployees) *
                          100
                        }%`
                      : '0%',
                }}
              >

                <div className="donut-inner">

                  <strong>
                    {totalEmployees
                      ? Math.round(
                          (activeEmployees /
                            totalEmployees) *
                            100
                        )
                      : 0}
                    %
                  </strong>

                  <span>
                    Active
                  </span>

                </div>

              </div>

              <div className="status-list">

                <div className="status-line">

                  <div>
                    <span className="status-dot active"></span>
                    Active
                  </div>

                  <strong>
                    {activeEmployees}
                  </strong>

                </div>

                <div className="status-line">

                  <div>
                    <span className="status-dot inactive"></span>
                    Inactive
                  </div>

                  <strong>
                    {inactiveEmployees}
                  </strong>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* EMPLOYEES */}

        <section className="employees-card">
<div className="employees-header">

  <div>

    <span className="analytics-label">
      EMPLOYEE MANAGEMENT
    </span>

    <h2>
      Employees
    </h2>

    <p>
      Add and manage your organization's employees.
    </p>

  </div>

</div>
          {/* FILTER BAR */}

          <div className="filter-bar">

            <label className="filter-search">

              <span>
                🔎
              </span>

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search name, email, department..."
              />

              {searchTerm && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() =>
                    setSearchTerm('')
                  }
                  title="Clear search"
                >
                  ×
                </button>
              )}

            </label>

            <label className="select-wrap">

              <span>
                🏢
              </span>

              <select
                value={departmentFilter}
                onChange={(event) =>
                  setDepartmentFilter(
                    event.target.value
                  )
                }
              >
                <option value="All">
                  All Departments
                </option>

                {departmentOptions.map(
                  (department) => (
                    <option
                      value={department}
                      key={department}
                    >
                      {department}
                    </option>
                  )
                )}

              </select>

            </label>

            <label className="select-wrap">

              <span>
                ●
              </span>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
              >

                <option value="All">
                  All Status
                </option>

                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>

              </select>

            </label>

          </div>

          <div className="results-row">

            <span>
              Showing{' '}
              <strong>
                {filteredEmployees.length}
              </strong>{' '}
              of{' '}
              <strong>
                {totalEmployees}
              </strong>{' '}
              employees
            </span>

            {(searchTerm ||
              departmentFilter !==
                'All' ||
              statusFilter !==
                'All') && (
              <button
                type="button"
                className="reset-filter"
                onClick={resetFilters}
              >
                Reset filters
              </button>
            )}

          </div>

          {/* TABLE */}

          {loadingEmployees ? (
  <div className="employee-skeleton-list">
    {[1, 2, 3, 4, 5].map((item) => (
      <div
        className="employee-skeleton-row"
        key={item}
      >
        <div className="skeleton skeleton-avatar"></div>

        <div className="skeleton-content">
          <div className="skeleton skeleton-name"></div>
          <div className="skeleton skeleton-email"></div>
        </div>

        <div className="skeleton skeleton-department"></div>
        <div className="skeleton skeleton-position"></div>
        <div className="skeleton skeleton-status"></div>
        <div className="skeleton skeleton-action"></div>
      </div>
    ))}
  </div>
)  
   : filteredEmployees.length ===
            0 ? (
            <div className="empty-state">

              <div className="empty-icon-large">
                👥
              </div>

              <h3>
                {employees.length ===
                0
                  ? 'No employees yet'
                  : 'No employees found'}
              </h3>

              <p>
                {employees.length ===
                0
                  ? 'Start building your employee directory by adding your first employee.'
                  : 'Try changing your search or filters to find an employee.'}
              </p>
{employees.length === 0 ? (
  isAdmin ? (
    <button
      type="button"
      className="primary-button"
      onClick={openAddModal}
    >
      ＋ Add Your First Employee
    </button>
  ) : null
) : (
  <button
    type="button"
    className="secondary-button"
    onClick={resetFilters}
  >
    Reset Filters
  </button>
)}

            </div>
          ) : (
            <div className="employee-table">

              <div className="table-head">

                <span>
                  EMPLOYEE
                </span>

                <span>
                  ROLE
                </span>

                <span>
                  STATUS
                </span>

                <span>
                  ACTIONS
                </span>

              </div>

              {filteredEmployees.map(
                (employee) => (
                  <div
                    className="employee-item"
                    key={employee.id}
                  >

                    <div className="employee-identity">

                      <div className="employee-avatar">
                        {employee.name
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>

                        <strong>
                          {employee.name}
                        </strong>

                        <span>
                          {employee.email}
                        </span>

                      </div>

                    </div>

                    <div className="employee-role">

                      <strong>
                        {employee.position ||
                          'Employee'}
                      </strong>

                      <span>
                        {employee.department ||
                          'No Department'}
                      </span>

                    </div>

                    <div>

                      <span
                        className={`status-pill ${
                          employee.status ===
                          'Active'
                            ? 'active'
                            : 'inactive'
                        }`}
                      >

                        <i></i>

                        {employee.status ||
                          'Inactive'}

                      </span>

                    </div>
<div className="employee-actions">

  <button
    type="button"
    className="action view"
    onClick={() =>
      openDetails(employee)
    }
    title="View employee"
  >
    👁
  </button>

  {isAdmin && (
    <button
      type="button"
      className="action edit"
      onClick={() =>
        openEditModal(employee)
      }
      title="Edit employee"
    >
      ✎
    </button>
  )}

  {isAdmin && (
    <button
      type="button"
      className="action delete"
      onClick={() =>
        handleDeleteEmployee(employee.id)
      }
      title="Delete employee"
    >
      🗑
    </button>
  )}

</div>

                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* =====================================================
    LEAVE REQUESTS
===================================================== */}

<section className="admin-leave-section">

  {/* HEADER */}
  <div className="admin-leave-header">

    <div className="admin-leave-title">

      <div className="admin-leave-main-icon">
        🏖️
      </div>

      <div>
        <span className="page-eyebrow">
          TIME OFF MANAGEMENT
        </span>

        <h2>
          Leave Requests
        </h2>

        <p>
          Review employee time-off requests.
        </p>
      </div>

    </div>


    <div className="leave-request-count">

      <span className="leave-count-dot"></span>

      <strong>
        {
          leaveRequests.filter(
            (leave) =>
              leave.status === "Pending"
          ).length
        }
      </strong>

      <span>
        Pending
      </span>

    </div>

  </div>


  {/* REQUEST LIST */}

  {loadingLeaves ? (

    <div className="admin-leave-empty">

      <div className="leave-loading-spinner"></div>

      <p>
        Loading leave requests...
      </p>

    </div>

  ) : leaveRequests.length === 0 ? (

    <div className="admin-leave-empty">

      <div className="leave-empty-icon">
        🏝️
      </div>

      <h3>
        No Leave Requests
      </h3>

      <p>
        Employee leave requests will appear here.
      </p>

    </div>

  ) : (

    <div className="leave-request-folder">

      {leaveRequests.map(
        (leave) => (

          <button
            type="button"
            className="leave-request-row"
            key={leave.id}
            onClick={() =>
              setSelectedLeave(leave)
            }
          >

            {/* EMPLOYEE */}

            <div className="leave-row-employee">

              <div className="leave-row-avatar">
                {(leave.employeeEmail || "E")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="leave-row-employee-info">

                <strong>
                  {leave.employeeEmail || "Employee"}
                </strong>

                <span>
                  Employee
                </span>

              </div>

            </div>


            {/* LEAVE INFO */}

            <div className="leave-row-info">

              <span className="leave-row-type">
                {leave.leaveType || "Leave"}
              </span>

              <span className="leave-row-date">
                {leave.startDate || "-"}
                {" → "}
                {leave.endDate || "-"}
              </span>

            </div>


            {/* DAYS */}

            <div className="leave-row-days">

              <strong>
                {leave.days || 0}
              </strong>

              <span>
                {Number(leave.days) === 1
                  ? "Day"
                  : "Days"}
              </span>

            </div>


            {/* STATUS */}

            <span
              className={`leave-status ${
                String(
                  leave.status || "Pending"
                ).toLowerCase()
              }`}
            >
              {leave.status || "Pending"}
            </span>


            {/* ARROW */}

            <span className="leave-row-arrow">
              →
            </span>

          </button>

        )
      )}

    </div>

  )}


  {/* FOOTER */}

  {leaveRequests.length > 0 && (

    <div className="leave-folder-footer">

      <span>
        Showing{" "}
        <strong>
          {leaveRequests.length}
        </strong>{" "}
        leave requests
      </span>

      <span>
        Click any request to view details →
      </span>

    </div>

  )}

</section>

{/* =====================================================
    LEAVE REQUEST DETAILS MODAL
===================================================== */}

{selectedLeave && (

  <div
    className="premium-modal-overlay"
    onMouseDown={(e) => {

      if (
        e.target === e.currentTarget
      ) {
        setSelectedLeave(null)
      }

    }}
  >

    <div className="premium-leave-details-modal">

      {/* MODAL HEADER */}

      <div className="leave-details-header">

        <div className="leave-details-title">

          <div className="leave-details-icon">
            🏖️
          </div>

          <div>

            <span>
              LEAVE REQUEST
            </span>

            <h2>
              Request Details
            </h2>

          </div>

        </div>


        <button
          type="button"
          className="modal-close-btn"
          onClick={() =>
            setSelectedLeave(null)
          }
        >
          ×
        </button>

      </div>


      {/* EMPLOYEE */}

      <div className="leave-details-employee">

        <div className="leave-details-avatar">

          {(selectedLeave.employeeEmail || "E")
            .charAt(0)
            .toUpperCase()}

        </div>

        <div>

          <strong>
            {selectedLeave.employeeEmail ||
              "Employee"}
          </strong>

          <span>
            Employee
          </span>

        </div>

      </div>


      {/* DETAILS GRID */}

      <div className="leave-details-grid">

        <div className="leave-detail-box">

          <span>
            LEAVE TYPE
          </span>

          <strong>
            {selectedLeave.leaveType ||
              "Leave"}
          </strong>

        </div>


        <div className="leave-detail-box">

          <span>
            DURATION
          </span>

          <strong>
            {selectedLeave.days || 0}{" "}
            {Number(selectedLeave.days) === 1
              ? "Day"
              : "Days"}
          </strong>

        </div>


        <div className="leave-detail-box">

          <span>
            START DATE
          </span>

          <strong>
            {selectedLeave.startDate || "-"}
          </strong>

        </div>


        <div className="leave-detail-box">

          <span>
            END DATE
          </span>

          <strong>
            {selectedLeave.endDate || "-"}
          </strong>

        </div>

      </div>


      {/* STATUS */}

      <div className="leave-details-status">

        <span>
          CURRENT STATUS
        </span>

        <span
          className={`leave-status ${
            String(
              selectedLeave.status ||
                "Pending"
            ).toLowerCase()
          }`}
        >
          {selectedLeave.status ||
            "Pending"}
        </span>

      </div>


      {/* REASON */}

      <div className="leave-details-reason">

        <span>
          REASON
        </span>

        <p>
          {selectedLeave.reason ||
            "No reason provided."}
        </p>

      </div>


      {/* ACTIONS */}

      {selectedLeave.status === "Pending" && (

        <div className="leave-details-actions">

          <button
            type="button"
            className="leave-reject-btn"
           onClick={() => {
  updateLeaveStatus(
    selectedLeave.id,
    'Rejected'
  )
}}
          >
            ✕ Reject
          </button>


          <button
            type="button"
            className="leave-approve-btn"
            onClick={() => {
  updateLeaveStatus(
    selectedLeave.id,
    'Approved'
  )
}}
          >
            ✓ Approve
          </button>

        </div>

      )}

    </div>

  </div>

)}

        {/* FOOTER */}

        <footer className="nexora-footer">

          <span className="footer-brand">
            ✦ NEXORA
          </span>

          <span>
            Employee Management Platform
          </span>

          <span className="footer-version">
            v2.0
          </span>

        </footer>

      </main>

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal()
            }
          }}
        >

          <div className="premium-modal">

            <div className="modal-top">

              <div>

                <span className="modal-eyebrow">
                  NEXORA
                </span>

                <h2>
                  {editingEmployee
                    ? 'Edit Employee'
                    : 'Add Employee'}
                </h2>

                <p>
                  {editingEmployee
                    ? 'Update employee information.'
                    : 'Create a new employee record.'}
                </p>

              </div>

              <button
                type="button"
                className="modal-x"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleSaveEmployee
              }
            >

              <div className="premium-form-grid">

                <div className="field">

                  <label>
                    Full Name *
                  </label>

                  <div className="input-box">

                    <span>
                      👤
                    </span>

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Rahul Sharma"
                    
                    />

                  </div>

                </div>

                <div className="field">

                  <label>
                    Email *
                  </label>

                  <div className="input-box">

                    <span>
                      ✉
                    </span>

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={
                        handleChange
                      }
                      placeholder="employee@example.com"
                    
                    />

                  </div>

                </div>

                <div className="field">

                  <label>
                    Phone
                  </label>

                  <div className="input-box">

                    <span>
                      📱
                    </span>

                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={
                        handleChange
                      }
                      placeholder="+91 98765 43210"
                    />

                  </div>

                </div>

                <div className="field">

                  <label>
                    Department
                  </label>

                  <div className="input-box">

                    <span>
                      🏢
                    </span>

                    <input
                      type="text"
                      name="department"
                      value={
                        form.department
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Engineering"
                    />

                  </div>

                </div>

                <div className="field">

                  <label>
                    Position
                  </label>

                  <div className="input-box">

                    <span>
                      💼
                    </span>

                    <input
                      type="text"
                      name="position"
                      value={
                        form.position
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Software Developer"
                    />

                  </div>

                </div>

                <div className="field">

                  <label>
                    Joining Date
                  </label>

                  <div className="input-box">

                    <span>
                      📅
                    </span>

                    <input
                      type="date"
                      name="joiningDate"
                      value={
                        form.joiningDate
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                </div>

                <div className="field field-full">

                  <label>
                    Status
                  </label>

                  <div className="input-box">

                    <span>
                      ●
                    </span>

                    <select
                      name="status"
                      value={
                        form.status
                      }
                      onChange={
                        handleChange
                      }
                    >

                      <option value="Active">
                        Active
                      </option>

                      <option value="Inactive">
                        Inactive
                      </option>

                    </select>

                  </div>

                </div>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : editingEmployee
                      ? 'Update Employee'
                      : 'Save Employee'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}
{/* =================================================
    DETAILS MODAL
================================================= */}
{showDetails &&
  selectedEmployee && (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          closeDetails()
        }
      }}
    >

      <div className="profile-modal">

        {/* HEADER */}

        <div className="modal-top">

          <div>

            <span className="modal-eyebrow">
              NEXORA • EMPLOYEE PROFILE
            </span>

            <h2>
              Employee Details
            </h2>

            <p>
              Complete employee
              information and profile.
            </p>

          </div>

          <button
            type="button"
            className="modal-x"
            onClick={
              closeDetails
            }
          >
            ×
          </button>

        </div>

        {/* PROFILE HERO */}

        <div className="profile-hero">

          <div className="profile-big-avatar">
            {selectedEmployee.name
              ?.charAt(0)
              .toUpperCase()}
          </div>

          <div className="profile-hero-info">

            <div className="profile-name-row">

              <h2>
                {
                  selectedEmployee.name
                }
              </h2>

              <span
                className={`status-pill ${
                  selectedEmployee.status ===
                  'Active'
                    ? 'active'
                    : 'inactive'
                }`}
              >

                <i></i>

                {
                  selectedEmployee.status ||
                  'Inactive'
                }

              </span>

            </div>

            <p>
              {selectedEmployee.position ||
                'Employee'}
              {' • '}
              {selectedEmployee.department ||
                'No Department'}
            </p>

            <span className="profile-member-label">
              ✦ NEXORA WORKFORCE MEMBER
            </span>

          </div>

        </div>

        {/* DETAILS */}

        <div className="profile-details-grid">

          <div className="detail-card">

            <span>
              📧 Email
            </span>

            <strong>
              {
                selectedEmployee.email ||
                'Not provided'
              }
            </strong>

          </div>

          <div className="detail-card">

            <span>
              📱 Phone
            </span>

            <strong>
              {
                selectedEmployee.phone ||
                'Not provided'
              }
            </strong>

          </div>

          <div className="detail-card">

            <span>
              🏢 Department
            </span>

            <strong>
              {
                selectedEmployee.department ||
                'Not provided'
              }
            </strong>

          </div>

          <div className="detail-card">

            <span>
              💼 Position
            </span>

            <strong>
              {
                selectedEmployee.position ||
                'Not provided'
              }
            </strong>

          </div>

          <div className="detail-card">

            <span>
              📅 Joining Date
            </span>

            <strong>
              {formatDate(
                selectedEmployee.joiningDate
              )}
            </strong>

          </div>

          <div className="detail-card">

            <span>
              🟢 Account Status
            </span>

            <strong>
              {
                selectedEmployee.status ||
                'Active'
              }
            </strong>

          </div>

        </div>

        {/* ACTIONS */}

        <div className="profile-modal-actions">

          <button
            type="button"
            className="cancel-btn"
            onClick={
              closeDetails
            }
          >
            Close
          </button>
{isAdmin && (
  <button
    type="button"
    className="primary-button"
    onClick={() => {
      const employee =
        selectedEmployee

      closeDetails()

      openEditModal(employee)
    }}
  >
    ✎ Edit Employee
  </button>
)}

        </div>

      </div>

    </div>
  )}
    </div>
  )
}

export default Dashboard
function EmployeeDashboard({
  user,
  userProfile,
  employees,
  onLogout,
  theme,
  toggleTheme,
}) {
  
  const [attendance, setAttendance] = useState(null)
  const [employeeNotifications, setEmployeeNotifications] =
  useState([])
  const [attendanceLoading, setAttendanceLoading] = useState(true)
  const [attendanceSaving, setAttendanceSaving] = useState(false)
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [attendanceHistoryLoading, setAttendanceHistoryLoading] = useState(true)
  const [leaveRequests, setLeaveRequests] = useState([])
  const [leaveLoading, setLeaveLoading] = useState(true)
  const [leaveSaving, setLeaveSaving] = useState(false)
  const [employeeDetails, setEmployeeDetails] = useState(null)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')
  const [toast, setToast] = useState(null)
  const [settingsName, setSettingsName] = useState('')
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'Casual',
    startDate: '',
    endDate: '',
    reason: '',
  })
  const [settingsForm, setSettingsForm] = useState({
  displayName:
    userProfile?.name ||
    userProfile?.fullName ||
    user?.displayName ||
    '',
})

const [settingsSaving, setSettingsSaving] =
  useState(false)

const [settingsMessage, setSettingsMessage] =
  useState('')

  useEffect(() => {
  setSettingsName(
    userProfile?.name ||
    userProfile?.fullName ||
    user?.displayName ||
    ''
  )
}, [
  userProfile?.name,
  userProfile?.fullName,
  user?.displayName,
])

  const employeeName =
    userProfile?.name ||
    userProfile?.fullName ||
    user?.displayName ||
    user?.email?.split('@')[0] ||
    'Employee'

  const today = (() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })()

  const showEmployeeToast = (message, type = 'info') => {
    setToast({ id: Date.now(), message, type })
    window.setTimeout(() => setToast(null), 3500)
  }

  const getCurrentTime = () =>
    new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

  const parseTime = (value) => {
    if (!value || typeof value !== 'string') return null
    const parts = value.trim().split(/\s+/)
    const timePart = parts[0]
    const modifier = (parts[1] || '').toUpperCase()
    const timeParts = timePart.split(':').map(Number)
    if (timeParts.length !== 2 || timeParts.some(Number.isNaN)) return null

    let hours = timeParts[0]
    const minutes = timeParts[1]
    if (modifier === 'PM' && hours !== 12) hours += 12
    if (modifier === 'AM' && hours === 12) hours = 0
    return hours * 60 + minutes
  }
const calculateActualWorkHours = (record) => {
  if (!record?.checkIn || !record?.checkOut) {
    return 'In Progress'
  }

  const checkInTime = parseTime(record.checkIn)
  const checkOutTime = parseTime(record.checkOut)

  if (
    checkInTime === null ||
    checkOutTime === null
  ) {
    return '—'
  }

  let totalMinutes =
    checkOutTime - checkInTime

  if (totalMinutes < 0) {
    totalMinutes += 1440
  }

  let breakMinutes = 0

  if (
    record.breakStart &&
    record.breakEnd
  ) {
    const breakStartTime =
      parseTime(record.breakStart)

    const breakEndTime =
      parseTime(record.breakEnd)

    if (
      breakStartTime !== null &&
      breakEndTime !== null
    ) {
      breakMinutes =
        breakEndTime - breakStartTime

      if (breakMinutes < 0) {
        breakMinutes += 1440
      }
    }
  }

  const actualWorkMinutes =
    totalMinutes - breakMinutes

  const hours =
    Math.floor(actualWorkMinutes / 60)

  const minutes =
    actualWorkMinutes % 60

  return `${hours}h ${String(minutes).padStart(2, '0')}m`
}

  useEffect(() => {
  if (!user?.uid) {
    setEmployeeNotifications([])
    return undefined
  }

  const notificationQuery = query(
    collection(db, 'notifications'),
    where('employeeId', '==', user.uid)
  )

  const unsubscribe = onSnapshot(
    notificationQuery,

    (snapshot) => {
      const notificationData =
        snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }))

      notificationData.sort(
        (a, b) =>
          (b.createdAt?.seconds || 0) -
          (a.createdAt?.seconds || 0)
      )

      setEmployeeNotifications(
        notificationData
      )
    },

    (error) => {
      console.error(
        'EMPLOYEE NOTIFICATION ERROR:',
        error
      )

      setEmployeeNotifications([])
    }
  )

  return () => unsubscribe()

}, [user?.uid])

const markEmployeeNotificationRead =
  async (notificationId) => {

    try {

      await updateDoc(
        doc(
          db,
          'notifications',
          notificationId
        ),

        {
          read: true,
          readAt: serverTimestamp(),
        }
      )

    } catch (error) {

      console.error(
        'NOTIFICATION UPDATE ERROR:',
        error
      )

    }
  }
const calculateWorkHours = () => {
  if (!attendance?.checkIn) {
    return '0h 00m'
  }

  if (!attendance?.checkOut) {
    return 'In Progress'
  }

  return calculateActualWorkHours(attendance)
}
const calculateBreakDuration = (record) => {
  if (
    !record?.breakStart ||
    !record?.breakEnd
  ) {
    return '—'
  }

  const start =
    parseTime(record.breakStart)

  const end =
    parseTime(record.breakEnd)

  if (
    start === null ||
    end === null
  ) {
    return '—'
  }

  let totalMinutes = end - start

  if (totalMinutes < 0) {
    totalMinutes += 1440
  }

  const hours =
    Math.floor(totalMinutes / 60)

  const minutes =
    totalMinutes % 60

  if (hours === 0) {
    return `${minutes} min`
  }

  return `${hours}h ${minutes}m`
}
const calculateWorkHoursForRecord = (record) => {
  const checkIn = parseTime(record?.checkIn)
  const checkOut = parseTime(record?.checkOut)

  if (
    checkIn === null ||
    checkOut === null
  ) {
    return '—'
  }

  let totalMinutes = checkOut - checkIn

  if (totalMinutes < 0) {
    totalMinutes += 1440
  }

  // Break time subtract karo
  if (
    record?.breakStart &&
    record?.breakEnd
  ) {
    const breakStart = parseTime(record.breakStart)
    const breakEnd = parseTime(record.breakEnd)

    if (
      breakStart !== null &&
      breakEnd !== null
    ) {
      let breakMinutes = breakEnd - breakStart

      if (breakMinutes < 0) {
        breakMinutes += 1440
      }

      totalMinutes -= breakMinutes
    }
  }

  if (totalMinutes < 0) {
    totalMinutes = 0
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${hours}h ${String(minutes).padStart(2, '0')}m`
}
  useEffect(() => {
    if (!user?.uid) {
      setAttendance(null)
      setAttendanceLoading(false)
      return undefined
    }

    setAttendanceLoading(true)
    const attendanceQuery = query(
      collection(db, 'attendance'),
      where('employeeId', '==', user.uid),
      where('date', '==', today)
    )

    const unsubscribe = onSnapshot(
      attendanceQuery,
      (snapshot) => {
        if (snapshot.empty) {
          setAttendance(null)
        } else {
          const docs = snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
          docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          setAttendance(docs[0])
        }
        setAttendanceLoading(false)
      },
      (error) => {
        console.error('Attendance Load Error:', error)
        setAttendance(null)
        setAttendanceLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid, today])

  useEffect(() => {
    if (!user?.uid) {
      setAttendanceHistory([])
      setAttendanceHistoryLoading(false)
      return undefined
    }

    setAttendanceHistoryLoading(true)
    const attendanceQuery = query(
      collection(db, 'attendance'),
      where('employeeId', '==', user.uid)
    )

    const unsubscribe = onSnapshot(
      attendanceQuery,
      (snapshot) => {
        const records = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }))
        records.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
        setAttendanceHistory(records)
        setAttendanceHistoryLoading(false)
      },
      (error) => {
        console.error('Attendance History Error:', error)
        setAttendanceHistory([])
        setAttendanceHistoryLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid])

  useEffect(() => {
    if (!user?.uid) {
      setLeaveRequests([])
      setLeaveLoading(false)
      return undefined
    }

    setLeaveLoading(true)
    const leaveQuery = query(
      collection(db, 'leaveRequests'),
      where('employeeId', '==', user.uid)
    )

    const unsubscribe = onSnapshot(
      leaveQuery,
      (snapshot) => {
        const requests = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }))
        requests.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        setLeaveRequests(requests)
        setLeaveLoading(false)
      },
      (error) => {
        console.error('Leave Requests Error:', error)
        setLeaveRequests([])
        setLeaveLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid])

  useEffect(() => {
    if (!user?.uid || !userProfile) {
      setEmployeeDetails(null)
      return
    }

    setEmployeeDetails({
      id: userProfile.uid || user.uid,
      ...userProfile,
      name: userProfile.name || user.displayName || 'Employee',
      email: userProfile.email || user.email || '',
      photoURL: userProfile.photoURL || user.photoURL || '',
    })
  }, [user?.uid, userProfile])

  const handleCheckIn = async () => {
    if (!user?.uid || attendanceSaving || attendance) return

    try {
      setAttendanceSaving(true)
      await addDoc(collection(db, 'attendance'), {
        employeeId: user.uid,
        employeeEmail: user.email || '',
        companyId: userProfile?.companyId || 'nexora',
        date: today,
        checkIn: getCurrentTime(),
        breakStart: '',
        checkOut: '',
        status: 'Present',
        createdAt: serverTimestamp(),
      })
      showEmployeeToast('Check-in recorded successfully.', 'success')
    } catch (error) {
      console.error('Check In Error:', error)
      showEmployeeToast('Unable to check in. Please try again.', 'error')
    } finally {
      setAttendanceSaving(false)
    }
  }
const handleBreakStart = async () => {
  if (!attendance?.id) return

  try {
    setAttendanceSaving(true)

    await updateDoc(
      doc(db, 'attendance', attendance.id),
      {
        breakStart: getCurrentTime(),
        breakStatus: 'on-break',
        updatedAt: serverTimestamp(),
      }
    )

    showEmployeeToast(
      'Break started successfully ☕',
      'success'
    )
  } catch (error) {
    console.error('Break Start Error:', error)

    showEmployeeToast(
      'Unable to start break',
      'error'
    )
  } finally {
    setAttendanceSaving(false)
  }
}
const handleBreakEnd = async () => {
  if (!attendance?.id) return

  try {
    setAttendanceSaving(true)

    await updateDoc(
      doc(db, 'attendance', attendance.id),
      {
        breakEnd: getCurrentTime(),
        breakStatus: 'completed',
        updatedAt: serverTimestamp(),
      }
    )

    showEmployeeToast(
      'Break ended. Welcome back! 🚀',
      'success'
    )
  } catch (error) {
    console.error('Break End Error:', error)

    showEmployeeToast(
      'Unable to end break',
      'error'
    )
  } finally {
    setAttendanceSaving(false)
  }
}
  const handleCheckOut = async () => {
    if (!attendance?.id || attendanceSaving || attendance.checkOut) return

    try {
      setAttendanceSaving(true)
      await updateDoc(doc(db, 'attendance', attendance.id), {
        checkOut: getCurrentTime(),
        status: 'Present',
        updatedAt: serverTimestamp(),
      })
      showEmployeeToast('Check-out recorded successfully.', 'success')
    } catch (error) {
      console.error('Check Out Error:', error)
      showEmployeeToast('Unable to check out. Please try again.', 'error')
    } finally {
      setAttendanceSaving(false)
    }
  }

  const calculateLeaveDays = () => {
    if (!leaveForm.startDate || !leaveForm.endDate) return 0
    const start = new Date(`${leaveForm.startDate}T00:00:00`)
    const end = new Date(`${leaveForm.endDate}T00:00:00`)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0
    return Math.floor((end.getTime() - start.getTime()) / 86400000) + 1
  }

  const handleApplyLeave = async () => {
    const days = calculateLeaveDays()
    if (!user?.uid || leaveSaving) return

    if (!leaveForm.startDate || !leaveForm.endDate || days <= 0 || !leaveForm.reason.trim()) {
      showEmployeeToast('Please select valid dates and enter a reason.', 'error')
      return
    }

    try {
      setLeaveSaving(true)
      await addDoc(collection(db, 'leaveRequests'), {
        companyId: userProfile?.companyId || 'nexora',
        employeeId: user.uid,
        employeeName: employeeName,
        employeeEmail: user.email || '',
        leaveType: leaveForm.leaveType,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        days,
        reason: leaveForm.reason.trim(),
        status: 'Pending',
        createdAt: serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null,
      })

      setLeaveForm({ leaveType: 'Casual', startDate: '', endDate: '', reason: '' })
      setShowLeaveModal(false)
      showEmployeeToast('Leave request submitted successfully.', 'success')
    } catch (error) {
      console.error('LEAVE SUBMIT ERROR:', error)
      showEmployeeToast('Failed to submit leave request.', 'error')
    } finally {
      setLeaveSaving(false)
    }
  }

  const calculateAttendancePercentage = () => {
    if (!attendanceHistory.length) return '0%'
    const presentDays = attendanceHistory.filter((record) => record.status === 'Present').length
    return `${Math.round((presentDays / attendanceHistory.length) * 100)}%`
  }

  const openLeaveModal = () => {
    setLeaveForm({ leaveType: 'Casual', startDate: '', endDate: '', reason: '' })
    setShowLeaveModal(true)
  }

  const navigationItems = [
    { id: 'dashboard', icon: '🏠', label: 'My Dashboard' },
    { id: 'profile', icon: '👤', label: 'My Profile' },
    { id: 'attendance', icon: '📅', label: 'My Attendance' },
    { id: 'leave', icon: '🏖️', label: 'My Leave' },
    { id: 'team', icon: '👥', label: 'My Team' },
    { id: 'notifications', icon: '🔔', label: 'Notifications' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ]

  const renderDashboard = () => (
    <>
      <div className="employee-stats">
        <div className="employee-stat-card">
          <div className="employee-stat-icon">📅</div>
          <div><span>Attendance</span><strong>{calculateAttendancePercentage()}</strong></div>
        </div>
        <div className="employee-stat-card">
          <div className="employee-stat-icon">🏖️</div>
          <div><span>Leave</span><strong>{Math.max(0, 12 - leaveRequests.filter((leave) => leave.status === 'Approved').reduce((sum, leave) => sum + Number(leave.days || 0), 0))} Days</strong></div>
        </div>
        <div className="employee-stat-card">
          <div className="employee-stat-icon">🟢</div>
          <div><span>Status</span><strong>{userProfile?.status || 'Active'}</strong></div>
        </div>
        <div className="employee-stat-card">
          <div className="employee-stat-icon">🕐</div>
          <div><span>Work Hours</span><strong>{calculateWorkHours()}</strong></div>
        </div>
      </div>

      <section className="employee-attendance-card">
        <div className="employee-section-header">
          <div>
            <h2>Today's Attendance</h2>
            <p>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <span className="employee-status-badge">
            {attendance?.status === 'Present' ? '● Present' : '● Not Checked In'}
          </span>
        </div>

        {attendanceLoading ? (
          <div className="employee-empty-state"><div>⏳</div><h3>Loading attendance...</h3><p>Fetching today's attendance.</p></div>
        ) : (
         <div className="employee-attendance-timeline">

  {/* CHECK IN */}

  <div className="employee-attendance-item">
    <span className="attendance-dot green">●</span>

    <div>
      <strong>Check In</strong>
      <span>{attendance?.checkIn || '--'}</span>
    </div>
  </div>

  {!attendance?.checkIn && (
    <button
      type="button"
      className="employee-primary-button"
      onClick={handleCheckIn}
      disabled={attendanceSaving}
    >
      {attendanceSaving
        ? 'Checking In...'
        : '✓ Check In'}
    </button>
  )}


  {/* BREAK */}

  <div className="employee-attendance-item">
    <span className="attendance-dot yellow">●</span>

    <div>
      <strong>Break</strong>

      <span>
        {attendance?.breakStart
          ? `${attendance.breakStart}${
              attendance.breakEnd
                ? ` - ${attendance.breakEnd}`
                : ' (On Break)'
            }`
          : '--'}
      </span>
    </div>
  </div>


  {/* START BREAK */}

  {attendance?.checkIn &&
    !attendance?.checkOut &&
    !attendance?.breakStart && (

      <button
        type="button"
        className="employee-primary-button break-button"
        onClick={handleBreakStart}
        disabled={attendanceSaving}
      >
        {attendanceSaving
          ? 'Starting Break...'
          : '☕ Start Break'}
      </button>
    )}


  {/* END BREAK */}

  {attendance?.checkIn &&
    attendance?.breakStart &&
    !attendance?.breakEnd &&
    !attendance?.checkOut && (

      <button
        type="button"
        className="employee-primary-button resume-button"
        onClick={handleBreakEnd}
        disabled={attendanceSaving}
      >
        {attendanceSaving
          ? 'Ending Break...'
          : '▶ Resume Work'}
      </button>
    )}


  {/* BREAK DURATION */}

  {attendance?.breakStart &&
    attendance?.breakEnd && (

      <div className="break-duration-info">
        ☕ Break Duration:{' '}
        <strong>
          {calculateBreakDuration(attendance)}
        </strong>
      </div>
    )}


  {/* CHECK OUT */}

  <div className="employee-attendance-item">
    <span className="attendance-dot red">●</span>

    <div>
      <strong>Check Out</strong>
      <span>{attendance?.checkOut || '--'}</span>
    </div>
  </div>


  {attendance?.checkIn &&
    !attendance?.checkOut && (

      <button
        type="button"
        className="employee-primary-button checkout-button"
        onClick={handleCheckOut}
        disabled={attendanceSaving}
      >
        {attendanceSaving
          ? 'Checking Out...'
          : '✓ Check Out'}
      </button>
    )}

</div>
        )}
      </section>
    </>
  )

  const renderProfile = () => {
    const profile = employeeDetails || userProfile || {}
    const fullName = profile.name || profile.fullName || user?.displayName || 'Employee'
    const email = profile.email || user?.email || '--'
    const phone = profile.phone || profile.phoneNumber || profile.mobile || '--'
    const department = profile.department || profile.dept || '--'
    const position = profile.position || profile.designation || profile.jobTitle || profile.title || '--'
    const joiningDate = profile.joiningDate || profile.joinDate || profile.dateOfJoining || '--'
    const company = profile.companyName || (profile.companyId === 'nexora' ? 'NEXORA' : profile.companyId) || 'NEXORA'
    const status = profile.status || 'Active'
    const photo = profile.photoURL || user?.photoURL || ''
    const initials = fullName.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase()
    const formatDate = (value) => {
      if (!value || value === '--') return '--'
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    return (
      <div className="premium-profile-page">
        <div className="profile-hero-card">
          <div className="profile-hero-glow profile-glow-one"></div>
          <div className="profile-hero-glow profile-glow-two"></div>
          <div className="profile-hero-content">
            <div className="profile-avatar-wrapper">
              {photo ? <img src={photo} alt={fullName} className="profile-avatar-image" /> : <div className="profile-avatar-fallback">{initials}</div>}
              <div className="profile-online-dot"></div>
            </div>
            <div className="profile-hero-info">
              <div className="profile-eyebrow"><span className="profile-eyebrow-dot"></span>EMPLOYEE PROFILE</div>
              <h1>{fullName}</h1>
              <p>{position !== '--' ? position : 'NEXORA Workforce Member'}</p>
              <div className="profile-hero-meta"><span>✉ {email}</span><span>🏢 {company}</span></div>
            </div>
            <div className="profile-status-card"><span className="profile-status-label">ACCOUNT STATUS</span><div className="profile-status-value"><span className="status-pulse"></span>{status}</div><span className="profile-status-sub">Currently active</span></div>
          </div>
        </div>
        <div className="profile-section-header"><div><span className="profile-section-kicker">PERSONAL INFORMATION</span><h2>My Profile</h2><p>Your personal employee information.</p></div><div className="profile-secure-badge">✓ Secure Profile</div></div>
        <div className="premium-profile-grid">
          {[
            ['FULL NAME', fullName], ['EMAIL', email], ['PHONE', phone], ['DEPARTMENT', department], ['POSITION', position], ['JOINING DATE', formatDate(joiningDate)], ['STATUS', status], ['COMPANY', company],
          ].map(([label, value]) => <div className="premium-profile-card" key={label}><div className="profile-card-icon">•</div><div className="profile-card-content"><span>{label}</span><strong>{value}</strong></div></div>)}
        </div>
        <div className="profile-footer-card"><div className="profile-footer-icon">✓</div><div><strong>Your profile is protected</strong><p>Your employee information is securely managed by NEXORA Workforce OS.</p></div></div>
      </div>
    )
  }

  const renderAttendance = () => (
    <div className="employee-page-card attendance-page">
      <div className="employee-section-header">
        <div><h2>My Attendance</h2><p>Track today's attendance and review previous records.</p></div>
      </div>
      <div className="attendance-main-card">
        <div className="attendance-main-top"><div><span className="attendance-card-label">TODAY'S ATTENDANCE</span><h3>{today}</h3><p>Keep your attendance up to date.</p></div><div className={attendance ? 'attendance-status-pill present' : 'attendance-status-pill pending'}><span>●</span>{attendance ? (attendance.checkOut ? 'Completed' : 'Present') : 'Not Checked In'}</div></div>
        <div className="attendance-timeline">
          {[['checkin', 'Check In', attendance?.checkIn || '--:--', 'Start of work', '✓'], ['break', 'Break', attendance?.breakStart || '--:--', 'Break started', '☕'], ['checkout', 'Check Out', attendance?.checkOut || '--:--', 'End of work', '→']].map(([type, label, value, sub, icon]) => <div className="attendance-timeline-item" key={type}><div className={`attendance-timeline-icon ${type}`}>{icon}</div><div className="attendance-timeline-content"><span>{label}</span><strong>{value}</strong><small>{sub}</small></div></div>)}
        </div>
        <div className="attendance-work-summary"><div className="attendance-work-icon">⏱</div><div><span>TOTAL WORK HOURS</span><strong>{calculateWorkHours()}</strong></div></div>
        <div className="attendance-action-bar">
          {!attendance && <button type="button" className="attendance-btn primary" onClick={handleCheckIn} disabled={attendanceSaving}>✓ {attendanceSaving ? 'Checking In...' : 'Check In'}</button>}
          {attendance && !attendance.breakStart && !attendance.checkOut && <button type="button" className="attendance-btn secondary" onClick={handleBreakStart} disabled={attendanceSaving}>☕ {attendanceSaving ? 'Starting...' : 'Start Break'}</button>}
          {attendance && !attendance.checkOut && <button type="button" className="attendance-btn danger" onClick={handleCheckOut} disabled={attendanceSaving}>→ {attendanceSaving ? 'Checking Out...' : 'Check Out'}</button>}
          {attendance?.checkOut && <div className="attendance-complete-message">✓ Attendance completed for today</div>}
        </div>
      </div>
      <div className="attendance-history-heading"><div><span className="attendance-eyebrow">ACTIVITY</span><h3>Attendance History</h3><p>Review your previous attendance records.</p></div><div className="attendance-record-count"><strong>{attendanceHistory.length}</strong><span>Records</span></div></div>
      <section className="attendance-section"><div className="attendance-history-card"><div className="attendance-history-header"><span>DATE</span><span>STATUS</span><span>CHECK IN</span><span>BREAK</span><span>CHECK OUT</span><span>WORK HOURS</span></div>{attendanceHistoryLoading ? <div className="attendance-history-empty"><div>⏳</div><h4>Loading attendance...</h4><p>Fetching your attendance records.</p></div> : attendanceHistory.length === 0 ? <div className="attendance-history-empty"><div>📅</div><h4>No Attendance Records</h4><p>Your attendance records will appear here after you check in.</p></div> : <div className="attendance-history-body">{attendanceHistory.map((record) => <div className="attendance-history-row" key={record.id}><div className="attendance-date-cell"><strong>{record.date || '—'}</strong><span>Attendance</span></div><div><span className={record.status === 'Present' ? 'history-status present' : 'history-status'}>● {record.status || 'Present'}</span></div><div className="history-time-cell"><strong>{record.checkIn || '—'}</strong></div><div className="history-time-cell"><strong>{record.breakStart || '—'}</strong></div><div className="history-time-cell"><strong>{record.checkOut || '—'}</strong></div><div className="history-hours-cell"><strong>{calculateWorkHoursForRecord(record)}</strong></div></div>)}</div>}</div></section>
    </div>
  )

  const renderLeave = () => {
    const pendingLeaves = leaveRequests.filter((leave) => leave.status === 'Pending').length
    const approvedLeaves = leaveRequests.filter((leave) => leave.status === 'Approved').length
    const rejectedLeaves = leaveRequests.filter((leave) => leave.status === 'Rejected').length
    const usedLeaves = leaveRequests.filter((leave) => leave.status === 'Approved').reduce((sum, leave) => sum + Number(leave.days || 0), 0)
    const annualLeaveAllowance = 12
    const remainingLeaves = Math.max(0, annualLeaveAllowance - usedLeaves)
    const leaveDays = calculateLeaveDays()
    const getLeaveIcon = (type) => ({ Sick: '🤒', Earned: '🌴', Unpaid: '📋' }[type] || '🏖️')

    return (
      <div className="leave-page">

  {/* ================================
      PAGE HEADER
  ================================= */}
  <div className="leave-content-header">
    <div>
      <span className="page-eyebrow">
        TIME OFF MANAGEMENT
      </span>

      <h2>Your Leave, Simplified</h2>

      <p>
        Track your balance, manage requests, and stay ahead
        of your time off.
      </p>
    </div>

    <button
      type="button"
      className="premium-primary-btn"
      onClick={openLeaveModal}
    >
      <span>＋</span>
      Apply Leave
    </button>
  </div>


  {/* ================================
      LEAVE SUMMARY CARDS
  ================================= */}
  <div className="leave-summary-grid">

    <div className="leave-stat-card">
      <div className="leave-stat-icon">
        🏖️
      </div>

      <div className="leave-stat-content">
        <span>Remaining Leave</span>

        <strong>
          {remainingLeaves}
        </strong>

        <small>
          of {annualLeaveAllowance} days
        </small>
      </div>
    </div>


    <div className="leave-stat-card">
      <div className="leave-stat-icon">
        ⏳
      </div>

      <div className="leave-stat-content">
        <span>Pending Requests</span>

        <strong>
          {pendingLeaves}
        </strong>
      </div>
    </div>


    <div className="leave-stat-card">
      <div className="leave-stat-icon">
        ✓
      </div>

      <div className="leave-stat-content">
        <span>Approved</span>

        <strong>
          {approvedLeaves}
        </strong>
      </div>
    </div>


    <div className="leave-stat-card">
      <div className="leave-stat-icon">
        📅
      </div>

      <div className="leave-stat-content">
        <span>Used This Year</span>

        <strong>
          {usedLeaves}
        </strong>

        <small>
          {rejectedLeaves} rejected
        </small>
      </div>
    </div>

  </div>


  {/* ================================
      LEAVE HISTORY
  ================================= */}
  <div className="leave-history-card premium-history-card">

    <div className="section-heading premium-section-heading">

      <div>
        <span className="page-eyebrow">
          REQUEST HISTORY
        </span>

        <h2>
          Leave Requests
        </h2>

        <p>
          Review and track all your submitted leave requests.
        </p>
      </div>


      <div className="leave-request-count premium-request-count">

        <strong>
          {leaveRequests.length}
        </strong>

        <span>
          {leaveRequests.length === 1
            ? 'Request'
            : 'Requests'}
        </span>

      </div>

    </div>


    {/* ================================
        LOADING STATE
    ================================= */}
    {leaveLoading ? (

      <div className="leave-empty-state">

        <div className="leave-empty-icon">
          ⏳
        </div>

        <h3>
          Loading your requests...
        </h3>

        <p>
          Please wait while we load your leave history.
        </p>

      </div>

    ) : leaveRequests.length === 0 ? (

      /* ================================
          EMPTY STATE
      ================================= */
      <div className="leave-empty-state">

        <div className="leave-empty-icon">
          🏝️
        </div>

        <h3>
          No leave requests yet
        </h3>

        <p>
          You haven't submitted any leave requests yet.
        </p>

        <button
          type="button"
          className="empty-state-btn"
          onClick={openLeaveModal}
        >
          Apply Your First Leave

          <span>
            →
          </span>
        </button>

      </div>

    ) : (

      /* ================================
          LEAVE REQUEST LIST
      ================================= */
      <div className="premium-leave-request-list">

        {leaveRequests.map((leave) => {

          const status =
            leave.status || 'Pending'

          const days =
            Number(leave.days || 0)

          return (

            <div
              className="premium-leave-request-item"
              key={leave.id}
            >

              {/* LEFT SIDE */}
              <div className="premium-leave-request-left">

                <div className="premium-leave-icon">
                  {getLeaveIcon(
                    leave.leaveType
                  )}
                </div>


                <div className="premium-leave-request-info">

                  <div className="premium-leave-title-row">

                    <div>

                      <h3>
                        {leave.leaveType ||
                          'Leave Request'}
                      </h3>

                      <span className="leave-request-subtitle">
                        Time Off Request
                      </span>

                    </div>


                    <span
                      className={`premium-leave-status premium-status-${status.toLowerCase()}`}
                    >

                      <span className="premium-status-dot" />

                      {status}

                    </span>

                  </div>


                  {/* DATE */}
                  <div className="premium-leave-date">

                    <span className="date-icon">
                      📅
                    </span>

                    <span>
                      {leave.startDate || '—'}
                    </span>

                    <span className="date-arrow">
                      →
                    </span>

                    <span>
                      {leave.endDate || '—'}
                    </span>

                  </div>


                  {/* REASON */}
                  <div className="premium-leave-reason">

                    <span className="reason-label">
                      Reason
                    </span>

                    <span className="reason-text">
                      {leave.reason ||
                        'No reason provided'}
                    </span>

                  </div>

                </div>

              </div>


              {/* RIGHT SIDE */}
              <div className="premium-leave-request-right">

                <div className="premium-days-box">

                  <strong>
                    {days}
                  </strong>

                  <span>
                    {days === 1
                      ? 'Day'
                      : 'Days'}
                  </span>

                </div>

              </div>

            </div>

          )
        })}

      </div>

    )}

  </div>


  {/* ================================
      APPLY LEAVE MODAL
  ================================= */}
  {showLeaveModal && (

    <div
      className="premium-modal-overlay"
      onMouseDown={(event) => {

        if (
          event.target === event.currentTarget &&
          !leaveSaving
        ) {
          setShowLeaveModal(false)
        }

      }}
    >

      <div className="premium-leave-modal">


        {/* MODAL HEADER */}
        <div className="premium-modal-header">

          <div className="modal-title-wrap">

            <div className="modal-icon">
              🏖️
            </div>


            <div>

              <span>
                TIME OFF REQUEST
              </span>

              <h2>
                Apply for Leave
              </h2>

              <p>
                Submit a new leave request
              </p>

            </div>

          </div>


          <button
            type="button"
            className="modal-close-btn"
            onClick={() => {

              if (!leaveSaving) {
                setShowLeaveModal(false)
              }

            }}
            disabled={leaveSaving}
          >
            ×
          </button>

        </div>


        {/* MODAL BODY */}
        <div className="premium-modal-body">


          {/* LEAVE TYPE */}
          <div className="form-group-premium">

            <label>
              Leave Type <span>*</span>
            </label>

            <select
              value={leaveForm.leaveType}
              onChange={(e) =>
                setLeaveForm((current) => ({
                  ...current,
                  leaveType: e.target.value,
                }))
              }
            >

              <option value="Casual">
                Casual Leave
              </option>

              <option value="Sick">
                Sick Leave
              </option>

              <option value="Earned">
                Earned Leave
              </option>

              <option value="Unpaid">
                Unpaid Leave
              </option>

            </select>

          </div>


          {/* DATE SECTION */}
          <div className="date-form-grid">


            {/* START DATE */}
            <div className="form-group-premium">

              <label>
                Start Date <span>*</span>
              </label>

              <input
                type="date"
                value={leaveForm.startDate}
                onChange={(e) =>

                  setLeaveForm((current) => ({

                    ...current,

                    startDate:
                      e.target.value,

                    endDate:
                      current.endDate &&
                      e.target.value >
                        current.endDate
                        ? ''
                        : current.endDate,

                  }))

                }
              />

            </div>


            {/* END DATE */}
            <div className="form-group-premium">

              <label>
                End Date <span>*</span>
              </label>

              <input
                type="date"

                min={
                  leaveForm.startDate ||
                  undefined
                }

                value={leaveForm.endDate}

                onChange={(e) =>

                  setLeaveForm((current) => ({
                    ...current,
                    endDate:
                      e.target.value,
                  }))

                }
              />

            </div>

          </div>


          {/* LEAVE DAYS */}
          <div className="leave-days-preview">

            <div className="days-preview-icon">
              📅
            </div>


            <div>

              <span>
                Leave Duration
              </span>

              <strong>

                {leaveDays > 0
                  ? `${leaveDays} ${
                      leaveDays === 1
                        ? 'Day'
                        : 'Days'
                    }`
                  : 'Select dates'}

              </strong>

            </div>

          </div>


          {/* REASON */}
          <div className="form-group-premium">

            <label>
              Reason <span>*</span>
            </label>

            <textarea
              rows="4"

              placeholder="Tell us why you need leave..."

              value={leaveForm.reason}

              onChange={(e) =>

                setLeaveForm((current) => ({
                  ...current,
                  reason:
                    e.target.value,
                }))

              }
            />

          </div>

        </div>


        {/* MODAL FOOTER */}
        <div className="premium-modal-footer">

          <button
            type="button"
            className="modal-cancel-btn"

            onClick={() =>
              setShowLeaveModal(false)
            }

            disabled={leaveSaving}
          >
            Cancel
          </button>


          <button
            type="button"
            className="modal-submit-btn"

            disabled={
              leaveSaving ||
              !leaveForm.startDate ||
              !leaveForm.endDate ||
              !leaveForm.reason.trim() ||
              leaveDays <= 0
            }

            onClick={handleApplyLeave}
          >

            {leaveSaving
              ? 'Submitting...'
              : (
                <>
                  Submit Leave Request
                  <span>→</span>
                </>
              )}

          </button>

        </div>

      </div>

    </div>

  )}

</div>
    )
  }
  const renderTeam = () => {
  const teamMembers = employees.filter((employee) => {
    // Current logged-in employee ko list mein show nahi karna
    const employeeUid =
      employee.uid ||
      employee.userId ||
      employee.id

    return employeeUid !== user?.uid
  })

  return (
    <section className="employee-page-card employee-team-page">

      <div className="employee-section-header">

        <div>
          <span className="page-eyebrow">
            TEAM DIRECTORY
          </span>

          <h2>My Team</h2>

          <p>
            Connect with your NEXORA team members.
          </p>
        </div>

        <div className="team-count-badge">
          <strong>
            {teamMembers.length}
          </strong>

          <span>
            {teamMembers.length === 1
              ? 'Member'
              : 'Members'}
          </span>
        </div>

      </div>


      {teamMembers.length === 0 ? (

        <div className="employee-empty-state team-empty-state">

          <div className="team-empty-icon">
            👥
          </div>

          <h3>
            No Team Members Yet
          </h3>

          <p>
            No other team members are currently available
            in your workspace.
          </p>

        </div>

      ) : (

        <div className="team-members-grid">

          {teamMembers.map((employee) => {

            const memberName =
              employee.name ||
              employee.fullName ||
              employee.displayName ||
              employee.email?.split('@')[0] ||
              'Employee'

            const memberPhoto =
              employee.photoURL ||
              employee.avatar ||
              ''

            return (

              <article
                key={employee.id}
                className="team-member-card"
              >

                <div className="team-member-avatar">

                  {memberPhoto ? (

                    <img
                      src={memberPhoto}
                      alt={memberName}
                    />

                  ) : (

                    <span>
                      {memberName
                        .charAt(0)
                        .toUpperCase()}
                    </span>

                  )}

                </div>


                <div className="team-member-info">

                  <h3>
                    {memberName}
                  </h3>

                  <p>
                    {employee.email ||
                      'No email available'}
                  </p>

                  {employee.department && (

                    <span className="team-member-department">
                      {employee.department}
                    </span>

                  )}

                </div>


                <div className="team-member-status">

                  <span
                    className={
                      employee.status === 'Inactive'
                        ? 'inactive'
                        : ''
                    }
                  ></span>

                  {employee.status ||
                    'Active'}

                </div>

              </article>

            )
          })}

        </div>

      )}

    </section>
  )
}
const renderNotifications = () => {

  const unreadCount =
    employeeNotifications.filter(
      (notification) => !notification.read
    ).length


  return (

    <section className="employee-page-card employee-notifications-page">

      <div className="employee-section-header">

        <div>

          <span className="page-eyebrow">
            NOTIFICATION CENTER
          </span>

          <h2>
            Notifications
          </h2>

          <p>
            Stay updated with your NEXORA workspace.
          </p>

        </div>


        <div className="notification-count-badge">

          <strong>
            {unreadCount}
          </strong>

          <span>
            Unread
          </span>

        </div>

      </div>


      {employeeNotifications.length === 0 ? (

        <div className="employee-empty-state">

          <div className="notifications-empty-icon">
            🔔
          </div>

          <h3>
            You're All Caught Up!
          </h3>

          <p>
            You don't have any notifications yet.
          </p>

        </div>

      ) : (

        <div className="employee-notifications-list">

          {employeeNotifications.map(
            (notification) => (

              <article

                key={notification.id}

                className={
                  `employee-notification-card ${
                    notification.read
                      ? 'read'
                      : 'unread'
                  }`
                }

                onClick={() => {

                  if (!notification.read) {

                    markEmployeeNotificationRead(
                      notification.id
                    )

                  }

                }}

              >

                <div className="employee-notification-icon">

                  {notification.type === 'success'
                    ? '✅'
                    : notification.type === 'warning'
                    ? '⚠️'
                    : notification.type === 'error'
                    ? '❌'
                    : '🔔'}

                </div>


                <div className="employee-notification-content">

                  <h3>

                    {notification.title ||
                      'New Notification'}

                  </h3>


                  <p>

                    {notification.message ||
                      'You have received a new update.'}

                  </p>


                  <span>

                    {notification.createdAt?.seconds

                      ? new Date(
                          notification.createdAt.seconds * 1000
                        ).toLocaleString('en-IN')

                      : 'Just now'}

                  </span>

                </div>


                {!notification.read && (

                  <div className="notification-unread-dot"></div>

                )}

              </article>

            )
          )}

        </div>

      )}

    </section>

  )
}
const handleSaveSettings = async () => {
  if (!user?.uid) {
    showEmployeeToast(
      'Please login again.',
      'error'
    )
    return
  }

  const name = settingsName.trim()

  if (!name) {
    showEmployeeToast(
      'Please enter your name.',
      'error'
    )
    return
  }

  try {
    setSettingsSaving(true)

    await updateDoc(
      doc(db, 'users', user.uid),
      {
        name,
      }
    )

    showEmployeeToast(
      'Settings saved successfully.',
      'success'
    )

  } catch (error) {
    console.error(
      'SETTINGS SAVE ERROR:',
      error
    )

    showEmployeeToast(
      'Failed to save settings.',
      'error'
    )

  } finally {
    setSettingsSaving(false)
  }
}
const renderSettings = () => (
  <section className="employee-page-card employee-settings-page">

    <div className="employee-section-header">

      <div>
        <span className="page-eyebrow">
          ACCOUNT PREFERENCES
        </span>

        <h2>
          Settings
        </h2>

        <p>
          Manage your workspace preferences.
        </p>
      </div>

    </div>


    <div className="employee-settings-list">


      {/* PROFILE */}

      <div className="employee-setting-card employee-profile-setting">

        <div className="employee-setting-icon">
          👤
        </div>

        <div className="employee-setting-content">

          <h3>
            Profile Name
          </h3>

          <p>
            Update the name displayed in your workspace.
          </p>

          <input
            type="text"
            value={settingsName}
            onChange={(event) =>
              setSettingsName(
                event.target.value
              )
            }
            placeholder="Enter your name"
            disabled={settingsSaving}
            className="employee-settings-input"
          />

        </div>

        <button
          type="button"
          className="employee-setting-button"
          onClick={handleSaveSettings}
          disabled={settingsSaving}
        >
          {settingsSaving
            ? 'Saving...'
            : 'Save'}
        </button>

      </div>


      {/* APPEARANCE */}

      <div className="employee-setting-card">

        <div className="employee-setting-icon">
          {theme === 'dark'
            ? '🌙'
            : '☀️'}
        </div>

        <div className="employee-setting-content">

          <h3>
            Appearance
          </h3>

          <p>
            Switch between light and dark mode.
          </p>

        </div>

        <button
          type="button"
          className="employee-setting-button"
          onClick={toggleTheme}
        >
          {theme === 'dark'
            ? 'Switch to Light'
            : 'Switch to Dark'}
        </button>

      </div>


      {/* ACCOUNT */}

      <div className="employee-setting-card">

        <div className="employee-setting-icon">
          ✉️
        </div>

        <div className="employee-setting-content">

          <h3>
            Account
          </h3>

          <p>
            {user?.email ||
              'No email available'}
          </p>

        </div>

        <span className="employee-setting-status">
          Google Account
        </span>

      </div>


      {/* ROLE */}

      <div className="employee-setting-card">

        <div className="employee-setting-icon">
          💼
        </div>

        <div className="employee-setting-content">

          <h3>
            Workspace Role
          </h3>

          <p>
            {userProfile?.role ||
              'Employee'}
          </p>

        </div>

        <span className="employee-setting-status active">
          Active
        </span>

      </div>


      {/* COMPANY */}

      <div className="employee-setting-card">

        <div className="employee-setting-icon">
          🏢
        </div>

        <div className="employee-setting-content">

          <h3>
            Company
          </h3>

          <p>
            {userProfile?.companyId ||
              'NEXORA'}
          </p>

        </div>

      </div>


      {/* LOGOUT */}

      <div className="employee-setting-card danger-setting">

        <div className="employee-setting-icon">
          🚪
        </div>

        <div className="employee-setting-content">

          <h3>
            Logout
          </h3>

          <p>
            Securely sign out from your account.
          </p>

        </div>

        <button
          type="button"
          className="employee-logout-setting"
          onClick={onLogout}
        >
          Logout
        </button>

      </div>


    </div>

  </section>
)
  const renderPage = () => {
    switch (activePage) {
      case 'profile': return renderProfile()
      case 'attendance': return renderAttendance()
      case 'leave': return renderLeave()
      case 'team': return renderTeam()
      case 'notifications': return renderNotifications()
      case 'settings': return renderSettings()
      default: return renderDashboard()
    }
  }

  return (
    <div className={`employee-dashboard ${theme === 'light' ? 'employee-light-mode' : 'employee-dark-mode'}`}>
      <style>{`
        .employee-dashboard {
          --employee-bg: #080b1c;
          --employee-surface: #0f1328;
          --employee-surface-2: #151a34;
          --employee-border: rgba(139, 92, 246, .22);
          --employee-text: #f7f8ff;
          --employee-muted: #9aa3c7;
          --employee-input: #0b1022;
          --employee-shadow: 0 20px 55px rgba(0,0,0,.24);
          min-height: 100vh;
          background: var(--employee-bg);
          color: var(--employee-text);
          transition: background .25s ease, color .25s ease;
        }
        .employee-dashboard.employee-light-mode {
          --employee-bg: #f4f6fb;
          --employee-surface: #ffffff;
          --employee-surface-2: #f8f9fd;
          --employee-border: rgba(99, 102, 241, .16);
          --employee-text: #17182b;
          --employee-muted: #667085;
          --employee-input: #ffffff;
          --employee-shadow: 0 18px 45px rgba(31, 41, 55, .08);
        }
        .employee-dashboard .employee-sidebar {
          background: var(--employee-surface);
          border-right: 1px solid var(--employee-border);
          color: var(--employee-text);
        }
        .employee-dashboard .employee-main { background: var(--employee-bg); color: var(--employee-text); }
        .employee-dashboard .employee-topbar,
        .employee-dashboard .employee-page-card,
        .employee-dashboard .employee-stat-card,
        .employee-dashboard .employee-attendance-card,
        .employee-dashboard .attendance-main-card,
        .employee-dashboard .attendance-history-card,
        .employee-dashboard .leave-history-card,
        .employee-dashboard .leave-stat-card,
        .employee-dashboard .premium-profile-card,
        .employee-dashboard .profile-hero-card,
        .employee-dashboard .profile-status-card,
        .employee-dashboard .profile-footer-card,
        .employee-dashboard .employee-settings-list,
        .employee-dashboard .employee-empty-state {
          background: var(--employee-surface);
          color: var(--employee-text);
          border-color: var(--employee-border);
          box-shadow: var(--employee-shadow);
        }
        .employee-dashboard .employee-nav-item { color: var(--employee-muted); }
        .employee-dashboard .employee-nav-item:hover { background: rgba(124,58,237,.10); color: var(--employee-text); }
        .employee-dashboard .employee-nav-item.active { color: #fff; }
        .employee-dashboard.employee-light-mode .employee-nav-item.active { color: #5b21b6; background: rgba(124,58,237,.10); }
        .employee-dashboard .employee-topbar h1,
        .employee-dashboard .employee-section-header h2,
        .employee-dashboard .section-heading,
        .employee-dashboard .attendance-history-heading,
        .employee-dashboard .leave-content-header h2,
        .employee-dashboard .profile-hero-info h2,
        .employee-dashboard .profile-section-header h3 { color: var(--employee-text); }
        .employee-dashboard .employee-topbar p,
        .employee-dashboard .employee-sidebar-section,
        .employee-dashboard .employee-user span,
        .employee-dashboard .attendance-eyebrow,
        .employee-dashboard .page-eyebrow,
        .employee-dashboard .leave-request-subtitle,
        .employee-dashboard .reason-label,
        .employee-dashboard .reason-text { color: var(--employee-muted); }
        .employee-dashboard .employee-user,
        .employee-dashboard .employee-avatar { border-color: var(--employee-border); }
        .employee-dashboard input,
        .employee-dashboard select,
        .employee-dashboard textarea {
          background: var(--employee-input);
          color: var(--employee-text);
          border-color: var(--employee-border);
        }
        .employee-dashboard input::placeholder,
        .employee-dashboard textarea::placeholder { color: var(--employee-muted); }
        .employee-dashboard .attendance-history-row,
        .employee-dashboard .premium-leave-request-item,
        .employee-dashboard .employee-attendance-item {
          background: var(--employee-surface-2);
          border-color: var(--employee-border);
          color: var(--employee-text);
        }
        .employee-dashboard.employee-light-mode .premium-leave-request-item,
        .employee-dashboard.employee-light-mode .employee-attendance-item { background: #fff; }
        .employee-dashboard .theme-toggle-button {
          width: 44px; height: 44px; border-radius: 13px;
          border: 1px solid var(--employee-border);
          background: var(--employee-surface-2); color: var(--employee-text);
          cursor: pointer; font-size: 19px; display: inline-flex;
          align-items: center; justify-content: center;
          transition: transform .2s ease, background .2s ease, border-color .2s ease;
        }
        .employee-dashboard .theme-toggle-button:hover { transform: translateY(-1px); border-color: rgba(124,58,237,.45); }
        .employee-dashboard .employee-topbar-actions { display: flex; align-items: center; gap: 12px; }
        .employee-dashboard.employee-light-mode .logout-button { background: #fff; color: #4b5563; border-color: var(--employee-border); }
        .employee-dashboard.employee-light-mode .modal-cancel-btn { background: #f3f4f6; color: #374151; }
      `}</style>
      {toast && <div className={`toast toast-${toast.type}`} role="alert"><span className="toast-message">{toast.message}</span><button type="button" className="toast-close" onClick={() => setToast(null)} aria-label="Close notification">×</button></div>}
      <aside className="employee-sidebar">
        <div className="employee-brand"><div className="employee-brand-title">✦ NEXORA</div><div className="employee-brand-subtitle">Workforce OS</div></div>
        <div className="employee-sidebar-section">MY WORKSPACE</div>
        <nav className="employee-nav">{navigationItems.slice(0, 6).map((item) => <button type="button" key={item.id} className={`employee-nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => setActivePage(item.id)}><span>{item.icon}</span><span>{item.label}</span></button>)}</nav>
        <nav className="employee-nav">{navigationItems.slice(6).map((item) => <button type="button" key={item.id} className={`employee-nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => setActivePage(item.id)}><span>{item.icon}</span><span>{item.label}</span></button>)}</nav>
      <div className="employee-sidebar-footer">
  {onLogout && (
    <button
      type="button"
      className="logout-button"
      onClick={onLogout}
    >
      ↪ Logout
    </button>
  )}
</div>
      </aside>
      <main className="employee-main">
        <div className="employee-topbar"><div><h1>{activePage === 'dashboard' ? `Good Morning, ${employeeName} 👋` : navigationItems.find((item) => item.id === activePage)?.label}</h1><p>{activePage === 'dashboard' ? "Here's your work overview." : 'Manage your employee workspace.'}</p></div><div className="employee-topbar-actions"><button type="button" className="theme-toggle-button" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'} aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>{theme === 'dark' ? '☀️' : '🌙'}</button><div className="employee-user"><div className="employee-avatar">{employeeName.charAt(0).toUpperCase()}</div><div><strong>{employeeName}</strong><span>Employee</span></div></div></div></div>
        {renderPage()}
      </main>
    </div>
  )
}