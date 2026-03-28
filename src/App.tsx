import { useState, useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import { supabase } from "../lib/supabase"
import type { User } from "@supabase/supabase-js"

//import Auth from "./pages/auth"

import WordList from "./pages/Study"
import WordDetail from "./pages/Studyt"
import Home from "./pages/Home"
import Studyhome from "./pages/Study_Home"
import StartLearning from "./pages/Nouns"
import ContactForm from "./pages/test"
import LessonComplete from "./pages/Congrats"
import AddWord from "../components/addWord"
import VoiceAI from "./pages/VoiceAI"
import Account from "./pages/Account"
import Wor from "./pages/study_design"
import Auth from "./pages/auth"
import Lest from "./pages/test_lu"


export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // get current session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    // listen for login/logout
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (loading) return <div>Loading...</div>

  // If not logged in → show Auth
  if (!user) {
 return <Auth />
  }

  return (
    <Routes>
      {/* Homepage */}
      <Route path="/" element={<Home />} />

      <Route path="/pinyin" element={<WordList />} />
      <Route path="/Studyhome" element={<Studyhome />} />
      <Route path="/start/:category" element={<StartLearning />} />
      <Route path="/test" element={<ContactForm />} />
      <Route path="/congrats" element={<LessonComplete />} />
      <Route path="/addword" element={<AddWord />} />
      <Route path="/pinyinai" element={<VoiceAI user={user} />} />
      <Route path="/wor/:id" element={<Wor />} />
      <Route path="/lest" element={<Lest />} />



      {/* Profile with Supabase user */}
      //<Route path="/account" element={<Account user={user} />} />

      {/* Dynamic word page */}
      <Route path="/word/:id" element={<WordDetail />} />
    </Routes>
  )
}

//  
