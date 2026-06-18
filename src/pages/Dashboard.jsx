import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '@/components/PageWrapper'
import { Lock, LogOut, Database, Zap } from 'lucide-react'
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, googleProvider, db } from '@/lib/firebase'
import { collection, addDoc, getDocs, updateDoc, doc, setDoc, getDoc } from 'firebase/firestore'
import TravelEngine from '@/pages/cms/TravelEngine'
import GenericEngine from '@/pages/cms/GenericEngine'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Overview')
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error("Login failed:", error)
      alert("Failed to sign in. Check console.")
    }
  }

  const [introText, setIntroText] = useState('')
  const [isSavingIntro, setIsSavingIntro] = useState(false)

  const DEFAULT_INTRO = "Welcome to my digital room. I built this space to step away from traditional, boring social profiles.\n\nEverything in this room represents a piece of my life—my travels, my journal, my health, and the ideas I'm exploring for the future. Take a look around.";

  useEffect(() => {
    const fetchIntro = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'intro'))
        if (snap.exists() && snap.data().text) {
          setIntroText(snap.data().text)
        } else {
          setIntroText(DEFAULT_INTRO)
        }
      } catch (err) {
        console.error("Failed to load intro:", err)
      }
    }
    fetchIntro()
  }, [])

  const handleSaveIntro = async () => {
    setIsSavingIntro(true)
    try {
      await setDoc(doc(db, 'settings', 'intro'), { text: introText })
      alert("Intro updated successfully!")
    } catch (err) {
      console.error("Failed to save intro:", err)
      alert("Failed to save intro.")
    } finally {
      setIsSavingIntro(false)
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/')
  }

  if (loading) {
    return (
      <PageWrapper title="Loading...">
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PageWrapper>
    )
  }

  if (!user) {
    return (
      <PageWrapper title="The Life Dashboard System" fullScreen hideBackButton={true}>
        <div className="flex flex-col items-center justify-center h-screen bg-[#f0eadd]">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-white/50 text-center max-w-sm w-full backdrop-blur-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="text-gray-400" size={28} />
            </div>
            <h2 className="text-2xl font-serif mb-2 text-gray-900">Admin Access</h2>
            <p className="text-sm text-gray-500 mb-8">Authenticate to enter the Life Dashboard CMS.</p>
            
            <button 
              onClick={handleLogin} 
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-800 py-3 rounded-xl hover:bg-gray-50 transition-colors shadow-sm font-medium"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (user.email !== 'abhishek.agrawal3101@gmail.com') {
    return (
      <PageWrapper title="Unauthorized" fullScreen hideBackButton={true}>
        <div className="flex flex-col items-center justify-center h-screen bg-[#f0eadd]">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-white/50 text-center max-w-sm w-full backdrop-blur-sm">
            <h2 className="text-2xl font-serif mb-2 text-red-600">Access Denied</h2>
            <p className="text-sm text-gray-500 mb-8">You are not authorized to access this dashboard.</p>
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-800 py-3 rounded-xl hover:bg-gray-50 transition-colors shadow-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title="Dashboard OS" fullScreen hideBackButton={true}>
      <div className="h-screen flex bg-gray-50">
        
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-serif text-xl font-bold text-gray-900">Life Dashboard</h2>
            <div className="mt-2 flex items-center gap-2">
              <img src={user.photoURL} alt="Profile" className="w-6 h-6 rounded-full" />
              <span className="text-xs text-gray-500 truncate">{user.email}</span>
            </div>
          </div>
          
          <div className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
            {['Overview', 'Travel Engine', 'Achievements', 'The Horizon', 'Curations', 'Athletics', 'The Ledger', 'Conversations'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {activeTab === 'Overview' && (
              <>
                <h1 className="text-3xl font-serif text-gray-900 mb-8">Welcome back, {user.displayName?.split(' ')[0]}</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-medium mb-4 text-gray-800">Quick Status</h3>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                          <input type="radio" name="status" defaultChecked className="accent-indigo-600" /> Active
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                          <input type="radio" name="status" className="accent-indigo-600" /> Travelling
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-medium mb-4 text-gray-800">Avatar Intro Text</h3>
                    <p className="text-sm text-gray-500 mb-4">This text displays when the visitor clicks on your avatar on the home page.</p>
                    <textarea 
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm min-h-[100px] mb-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={introText}
                      onChange={(e) => setIntroText(e.target.value)}
                      placeholder="Welcome to my digital room..."
                    />
                    <button 
                      onClick={handleSaveIntro}
                      disabled={isSavingIntro}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {isSavingIntro ? 'Saving...' : 'Save Intro'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'Travel Engine' && <TravelEngine />}
            
            {activeTab === 'Achievements' && (
              <GenericEngine 
                collectionName="achievements" 
                title="Achievements" 
                description="Manage your milestones, awards, and major life events."
                schema={[
                  { name: 'title', label: 'Title', type: 'text' },
                  { name: 'category', label: 'Category', type: 'select', options: ['Milestone', 'Award', 'Personal', 'Career'] },
                  { name: 'date', label: 'Date', type: 'date' },
                  { name: 'description', label: 'Description', type: 'textarea' },
                  { name: 'link', label: 'Link (Optional)', type: 'text', required: false },
                  { name: 'image', label: 'Upload Image', type: 'image' }
                ]}
              />
            )}

            {activeTab === 'The Horizon' && (
              <GenericEngine 
                collectionName="horizon" 
                title="The Horizon" 
                description="Visions, startup ideas, and profound thoughts for the future."
                schema={[
                  { name: 'title', label: 'Title', type: 'text' },
                  { name: 'category', label: 'Category', type: 'select', options: ['Startup', 'Thought', 'Vision'] },
                  { name: 'tags', label: 'Tags (comma separated)', type: 'text', required: false },
                  { name: 'description', label: 'Description/Idea', type: 'textarea' },
                  { name: 'link', label: 'Link (Optional)', type: 'text', required: false },
                  { name: 'image', label: 'Wireframe/Picture', type: 'image' }
                ]}
              />
            )}

            {activeTab === 'Curations' && (
              <GenericEngine 
                collectionName="curations" 
                title="Curations" 
                description="Books, movies, music, and articles you recommend."
                schema={[
                  { name: 'title', label: 'Title', type: 'text' },
                  { name: 'category', label: 'Category', type: 'select', options: ['Book', 'Movie', 'Music', 'Article'] },
                  { name: 'author', label: 'Author/Creator', type: 'text', required: false },
                  { name: 'review', label: 'Review/Thoughts', type: 'textarea' },
                  { name: 'link', label: 'Link (YouTube/Article)', type: 'text', required: false },
                  { name: 'image', label: 'Cover Image', type: 'image' }
                ]}
              />
            )}

            {activeTab === 'Athletics' && (
              <GenericEngine 
                collectionName="athletics" 
                title="Athletics & Sports" 
                description="Log your daily activities and related memories."
                schema={[
                  { name: 'date', label: 'Date', type: 'date' },
                  { name: 'gym', label: 'Gym', type: 'select', options: ['No', 'Yes'] },
                  { name: 'cycling', label: 'Cycling (km)', type: 'number', defaultValue: '0' },
                  { name: 'swimming', label: 'Swimming (m)', type: 'number', defaultValue: '0' },
                  { name: 'running', label: 'Running (km)', type: 'number', defaultValue: '0' },
                  { name: 'racketSport', label: 'Racket Sport', type: 'select', options: ['None', 'Tennis', 'Badminton', 'Squash', 'Pickleball'], defaultValue: 'None' },
                  { name: 'journal', label: 'Journal/Memory', type: 'textarea' },
                  { name: 'image', label: 'Memory Photo (Optional)', type: 'image' }
                ]}
              />
            )}

            {activeTab === 'The Ledger' && (
              <GenericEngine 
                collectionName="journal" 
                title="The Ledger (Journal)" 
                description="Your personal thoughts and emotional ledger."
                schema={[
                  { name: 'topic', label: 'Topic', type: 'text' },
                  { name: 'date', label: 'Date', type: 'date' },
                  { name: 'mood', label: 'Mood', type: 'select', options: ['Happy', 'Reflective', 'Stressed', 'Energetic', 'Calm'] },
                  { name: 'text', label: 'Journal Entry', type: 'textarea' }
                ]}
              />
            )}

            {activeTab === 'Conversations' && (
              <div className="space-y-8">
                <GenericEngine 
                  collectionName="conversations" 
                  title="Coffee Conversations" 
                  description="Manage conversation starters and contact links for the coffee page."
                  schema={[
                    { name: 'prompt', label: 'Conversation Starter / Prompt', type: 'textarea' },
                    { name: 'category', label: 'Category', type: 'select', options: ['Startup', 'Philosophy', 'Personal', 'Travel'] },
                    { name: 'isActive', label: 'Is Active?', type: 'select', options: ['Yes', 'No'], defaultValue: 'Yes' }
                  ]}
                />

                <GenericEngine 
                  collectionName="socials" 
                  title="Contact Details & Socials" 
                  description="Manage your WhatsApp, Email, and Social Media links displayed on the Coffee page."
                  schema={[
                    { name: 'platform', label: 'Platform', type: 'select', options: ['WhatsApp', 'Email', 'Twitter', 'LinkedIn', 'Instagram'] },
                    { name: 'value', label: 'Handle / Number / Email', type: 'text' },
                    { name: 'isActive', label: 'Active?', type: 'select', options: ['Yes', 'No'], defaultValue: 'Yes' }
                  ]}
                />
              </div>
            )}

          </div>
        </div>

      </div>
    </PageWrapper>
  )
}
