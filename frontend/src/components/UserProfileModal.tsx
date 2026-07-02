import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { showToast } from './Toast'
import { api } from '../services/api'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

type ProfileUpdateResponse = {
  id: string
  name: string
  email: string
  profileImage?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, updateUser } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const modalRef = useRef<HTMLDivElement>(null)

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile')
  const [savingProfile, setSavingProfile] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Profile state
  const [name, setName] = useState(user?.name || '')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [originalName, setOriginalName] = useState(user?.name || '')
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // OTP reset state
  const [showOtpForm, setShowOtpForm] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpNewPassword, setOtpNewPassword] = useState('')
  const [otpConfirmPassword, setOtpConfirmPassword] = useState('')
  const [otpCooldown, setOtpCooldown] = useState(0)

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Focus trap in modal
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      firstElement?.focus()

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }

      document.addEventListener('keydown', handleTab)
      return () => document.removeEventListener('keydown', handleTab)
    }
  }, [isOpen])

  // OTP cooldown timer
  useEffect(() => {
    let interval: number
    if (otpCooldown > 0) {
      interval = window.setInterval(() => {
        setOtpCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => window.clearInterval(interval)
  }, [otpCooldown])

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        if (hasUnsavedChanges) {
          if (confirm('You have unsaved changes. Are you sure you want to close?')) {
            onClose()
          }
        } else {
          onClose()
        }
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, hasUnsavedChanges])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(user?.name || '')
      setOriginalName(user?.name || '')
      setOriginalImage(user?.profileImage || null)
      setImagePreview(null)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowOtpForm(false)
      setOtpCode('')
      setOtpNewPassword('')
      setOtpConfirmPassword('')
      setOtpCooldown(0)
      setError(null)
      setHasUnsavedChanges(false)
    }
  }, [isOpen, user])

  // Track unsaved changes
  useEffect(() => {
    const nameChanged = name !== originalName
    const imageChanged = imagePreview !== originalImage
    setHasUnsavedChanges(nameChanged || imageChanged)
  }, [name, imagePreview, originalName, originalImage])

  const initials = useMemo(() => {
    return user?.name
      ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
      : 'U'
  }, [user?.name])

  // Password strength calculator (memoized)
  const getPasswordStrength = useCallback((password: string): { score: number; label: string; color: string } => {
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' }
    if (score <= 3) return { score, label: 'Medium', color: 'bg-yellow-500' }
    if (score <= 4) return { score, label: 'Strong', color: 'bg-green-500' }
    return { score, label: 'Very Strong', color: 'bg-emerald-500' }
  }, [])

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Only JPG, JPEG, PNG, and WEBP images are allowed')
        return
      }
      
      setUploadingAvatar(true)
      
      // Show preview immediately
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to server using FormData
      const formData = new FormData()
      formData.append('avatar', file)

      try {
        const response = await fetch('/api/users/upload-avatar', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('scopeai_token')}`,
          },
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Failed to upload avatar')
        }

        const data = await response.json()
        setImagePreview(data.data.avatarUrl)
        updateUser({ ...user, profileImage: data.data.avatarUrl })
        showToast('Avatar uploaded successfully', 'success')
      } catch (err) {
        showToast('Failed to upload avatar', 'error')
        // Revert preview on error
        setImagePreview(user?.profileImage || null)
      } finally {
        setUploadingAvatar(false)
      }
    }
  }, [user, updateUser])

  const handleRemoveAvatar = useCallback(() => {
    setImagePreview(null)
    // In production, call API to remove avatar
    showToast('Avatar removed', 'success')
  }, [])

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    setError(null)

    try {
      const updatedUser = await api.put<ProfileUpdateResponse>('/users/profile', {
        name,
        profileImage: imagePreview ?? undefined,
      })
      updateUser(updatedUser)
      showToast('Profile updated successfully', 'success')
      onClose()
    } catch (err) {
      showToast('Failed to update profile', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    setError(null)

    if (!currentPassword) {
      setError('Current password is required')
      return
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(newPassword)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setChangingPassword(true)
    try {
      await api.post('/users/change-password', { currentPassword, newPassword })
      showToast('Password updated successfully', 'success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      showToast('Failed to update password. Please check your current password.', 'error')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleSendOtp = async () => {
    setSendingOtp(true)
    setError(null)

    try {
      await api.post('/users/send-otp', { email: user?.email })
      setShowOtpForm(true)
      setOtpCooldown(60) // Start 60 second cooldown
      showToast('OTP sent to your email', 'success')
    } catch (err: any) {
      if (err.response?.status === 429) {
        showToast(err.response.data.message || 'Too many OTP requests. Please try again later.', 'error')
      } else {
        showToast('Failed to send OTP', 'error')
      }
    } finally {
      setSendingOtp(false)
    }
  }

  const handleResetPassword = async () => {
    setError(null)

    if (!otpCode) {
      setError('OTP code is required')
      return
    }
    if (!/^\d{6}$/.test(otpCode)) {
      setError('OTP must be exactly 6 digits')
      return
    }
    if (otpNewPassword.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(otpNewPassword)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number')
      return
    }
    if (otpNewPassword !== otpConfirmPassword) {
      setError('Passwords do not match')
      return
    }

    setResettingPassword(true)
    try {
      await api.post('/users/reset-password', { email: user?.email, otp: otpCode, newPassword: otpNewPassword })
      showToast('Password reset successfully', 'success')
      setShowOtpForm(false)
      setOtpCode('')
      setOtpNewPassword('')
      setOtpConfirmPassword('')
    } catch (err) {
      showToast('Invalid or expired OTP', 'error')
    } finally {
      setResettingPassword(false)
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg rounded-2xl bg-[var(--bg-surface)] shadow-2xl dark:bg-gray-800 transition-all animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-primary)] px-6 py-4 dark:border-gray-700">
          <div>
            <h2 id="settings-title" className="text-xl font-semibold text-[var(--text-primary)] dark:text-white">⚙️ Settings</h2>
            <p className="text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Manage your account settings</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-lg p-2 text-[var(--text-subtle)] hover:bg-[var(--bg-section)] hover:text-[var(--text-muted)] dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border-primary)] px-6 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 text-sm font-medium transition ${
              activeTab === 'profile'
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'text-[var(--text-soft)] hover:text-[var(--text-secondary)] dark:text-[var(--text-subtle)] dark:hover:text-gray-300'
            }`}
          >
            Account
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-3 text-sm font-medium transition ${
              activeTab === 'security'
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'text-[var(--text-soft)] hover:text-[var(--text-secondary)] dark:text-[var(--text-subtle)] dark:hover:text-gray-300'
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-3 text-sm font-medium transition ${
              activeTab === 'preferences'
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'text-[var(--text-soft)] hover:text-[var(--text-secondary)] dark:text-[var(--text-subtle)] dark:hover:text-gray-300'
            }`}
          >
            Preferences
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
          {/* Error Messages */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  {uploadingAvatar && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-black/50">
                      <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                  {imagePreview || user?.profileImage ? (
                    <>
                      <img
                        src={imagePreview || user?.profileImage || undefined}
                        alt="Profile"
                        className="h-24 w-24 rounded-full object-cover"
                      />
                      <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                        <label className="cursor-pointer text-white hover:text-gray-200 transition" title="Change avatar">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleImageUpload}
                            className="hidden"
                            aria-label="Upload profile picture"
                          />
                        </label>
                        <button
                          onClick={handleRemoveAvatar}
                          className="text-white hover:text-red-300 transition"
                          title="Remove avatar"
                          aria-label="Remove avatar"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 text-2xl font-semibold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                        {initials}
                      </div>
                      <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition" title="Upload avatar">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleImageUpload}
                          className="hidden"
                          aria-label="Upload profile picture"
                        />
                      </label>
                    </>
                  )}
                </div>
                <p className="mt-2 text-sm text-[var(--text-soft)] dark:text-[var(--text-subtle)]">
                  {imagePreview || user?.profileImage ? 'Hover to change or remove' : 'Click camera icon to upload'}
                </p>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] dark:text-gray-300">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[var(--border-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="mt-1 w-full rounded-lg border border-[var(--border-secondary)] px-3 py-2 text-sm text-[var(--text-soft)] bg-[var(--bg-section)] dark:border-gray-600 dark:bg-gray-700/50 dark:text-[var(--text-subtle)]"
                  />
                </div>
              </div>

              {/* Account Information */}
              <div className="rounded-lg bg-[var(--bg-section)] p-4 dark:bg-gray-700/30">
                <h4 className="text-sm font-medium text-[var(--text-primary)] dark:text-white mb-3">Account Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Member Since</p>
                    <p className="text-sm font-medium text-[var(--text-primary)] dark:text-white">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Role</p>
                    <p className="text-sm font-medium text-[var(--text-primary)] dark:text-white">User</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Account Status</p>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      <p className="text-sm font-medium text-[var(--text-primary)] dark:text-white">Active</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Last Login</p>
                    <p className="text-sm font-medium text-[var(--text-primary)] dark:text-white">Today</p>
                  </div>
                </div>
              </div>

              {/* Account Preferences */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] dark:text-gray-300 mb-2">Theme</label>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 rounded-lg border border-[var(--border-secondary)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-section)] dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  {theme === 'light' ? (
                    <>
                      <svg className="h-5 w-5 text-[var(--text-soft)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Light
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 text-[var(--text-soft)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      Dark
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Active Sessions */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[var(--text-primary)] dark:text-white">Active Sessions</h3>
                <div className="space-y-3">
                  {/* Current Session */}
                  <div className="flex items-center justify-between rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-indigo-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)] dark:text-white">This Device</p>
                        <p className="text-xs text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Chrome on Windows • Current session</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Active
                    </span>
                  </div>

                  {/* Other Sessions (placeholder for future implementation) */}
                  <div className="flex items-center justify-between rounded-lg border border-[var(--border-primary)] bg-[var(--bg-surface)] p-4 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-section)] text-[var(--text-muted)] dark:bg-gray-700 dark:text-[var(--text-subtle)]">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)] dark:text-white">Mobile Device</p>
                        <p className="text-xs text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Safari on iOS • 2 hours ago</p>
                      </div>
                    </div>
                    <button className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                      Revoke
                    </button>
                  </div>
                </div>
              </div>

              {/* Last Login */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[var(--text-primary)] dark:text-white">Last Login</h3>
                <div className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-section)] p-4 dark:border-gray-700 dark:bg-gray-800">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Time</p>
                      <p className="text-sm font-medium text-[var(--text-primary)] dark:text-white">{new Date().toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-soft)] dark:text-[var(--text-subtle)]">IP Address</p>
                      <p className="text-sm font-medium text-[var(--text-primary)] dark:text-white">192.168.1.1</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Location</p>
                      <p className="text-sm font-medium text-[var(--text-primary)] dark:text-white">San Francisco, CA</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-soft)] dark:text-[var(--text-subtle)]">Device</p>
                      <p className="text-sm font-medium text-[var(--text-primary)] dark:text-white">Chrome / Windows</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Management */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[var(--text-primary)] dark:text-white">Session Management</h3>
                <button
                  onClick={() => {
                    showToast('Logged out from all devices', 'success')
                  }}
                  className="w-full rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
                >
                  Log Out All Devices
                </button>
              </div>

              {/* Password Change */}
              <div className="border-t border-[var(--border-primary)] pt-6 dark:border-gray-700">
                <h3 className="text-lg font-medium text-[var(--text-primary)] dark:text-white">Change Password</h3>

                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] dark:text-gray-300">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[var(--border-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] dark:text-gray-300">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[var(--border-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                    />
                    {newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full dark:bg-gray-700">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${getPasswordStrength(newPassword).color}`}
                              style={{ width: `${(getPasswordStrength(newPassword).score / 6) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-[var(--text-muted)] dark:text-[var(--text-subtle)]">
                            {getPasswordStrength(newPassword).label}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] dark:text-gray-300">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[var(--border-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                    />
                    {confirmPassword && newPassword && (
                      <p className={`mt-1 text-xs ${confirmPassword === newPassword ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {confirmPassword === newPassword ? 'Passwords match' : 'Passwords do not match'}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                    className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {changingPassword ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>

                {/* Forgot Password */}
                <div className="border-t border-[var(--border-primary)] pt-4 dark:border-gray-700">
                  <p className="text-sm text-[var(--text-muted)] dark:text-[var(--text-subtle)] mb-3">Forgot your password?</p>
                  <button
                    onClick={handleSendOtp}
                    disabled={sendingOtp || otpCooldown > 0}
                    className="w-full rounded-lg border border-[var(--border-secondary)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-section)] dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {sendingOtp ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : otpCooldown > 0 ? (
                      `Resend in ${otpCooldown}s`
                    ) : (
                      'Send OTP to Email'
                    )}
                  </button>
                </div>
              </div>

              {showOtpForm && (
                <div className="border-t border-[var(--border-primary)] pt-6 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-[var(--text-primary)] dark:text-white">Reset Password with OTP</h3>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] dark:text-gray-300">OTP Code</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter the 6-digit code"
                        className="mt-1 w-full rounded-lg border border-[var(--border-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] dark:text-gray-300">New Password</label>
                      <input
                        type="password"
                        value={otpNewPassword}
                        onChange={(e) => setOtpNewPassword(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-[var(--border-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                      />
                      {otpNewPassword && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full dark:bg-gray-700">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${getPasswordStrength(otpNewPassword).color}`}
                                style={{ width: `${(getPasswordStrength(otpNewPassword).score / 6) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-[var(--text-muted)] dark:text-[var(--text-subtle)]">
                              {getPasswordStrength(otpNewPassword).label}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] dark:text-gray-300">Confirm Password</label>
                      <input
                        type="password"
                        value={otpConfirmPassword}
                        onChange={(e) => setOtpConfirmPassword(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-[var(--border-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                      />
                      {otpConfirmPassword && otpNewPassword && (
                        <p className={`mt-1 text-xs ${otpConfirmPassword === otpNewPassword ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {otpConfirmPassword === otpNewPassword ? 'Passwords match' : 'Passwords do not match'}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={handleResetPassword}
                      disabled={resettingPassword}
                      className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {resettingPassword ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Resetting...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </button>

                    <button
                      onClick={() => setShowOtpForm(false)}
                      className="w-full rounded-lg border border-[var(--border-secondary)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-section)] dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-[var(--text-primary)] dark:text-white">Preferences</h3>

              {/* Theme Preferences */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-[var(--text-secondary)] dark:text-gray-300">Theme</h4>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      document.documentElement.classList.remove('dark')
                      localStorage.setItem('theme', 'light')
                    }}
                    className={`flex-1 rounded-lg border px-4 py-3 text-sm transition ${
                      theme === 'light'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                        : 'border-[var(--border-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-section)] dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => {
                      document.documentElement.classList.add('dark')
                      localStorage.setItem('theme', 'dark')
                    }}
                    className={`flex-1 rounded-lg border px-4 py-3 text-sm transition ${
                      theme === 'dark'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                        : 'border-[var(--border-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-section)] dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    Dark
                  </button>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-[var(--text-secondary)] dark:text-gray-300">Notifications</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="h-4 w-4 rounded border-[var(--border-secondary)] text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="text-sm text-[var(--text-secondary)] dark:text-gray-300">Email notifications</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="h-4 w-4 rounded border-[var(--border-secondary)] text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="text-sm text-[var(--text-secondary)] dark:text-gray-300">Project alerts</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="h-4 w-4 rounded border-[var(--border-secondary)] text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="text-sm text-[var(--text-secondary)] dark:text-gray-300">Deadline reminders</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      defaultChecked={false}
                      className="h-4 w-4 rounded border-[var(--border-secondary)] text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="text-sm text-[var(--text-secondary)] dark:text-gray-300">Weekly reports</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Only show on Account tab */}
        {activeTab === 'profile' && (
          <div className="flex justify-end gap-3 border-t border-[var(--border-primary)] px-6 py-4 dark:border-gray-700">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-section)] dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {savingProfile ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
