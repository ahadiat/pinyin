import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import Avatar from "./Avatar"
import type { User } from "@supabase/supabase-js"
import { LogOut, Save, Globe, User as UserIcon, Key } from "lucide-react" // Optional: install lucide-react

type AccountProps = {
  user: User
}

export default function Account({ user }: AccountProps) {
  const [loading, setLoading] = useState<boolean>(true)
  const [username, setUsername] = useState<string>("")
  const [website, setWebsite] = useState<string>("")
  const [avatar_url, setAvatarUrl] = useState<string | null>(null)
  const [openrouter_api_key, setOpenRouterKey] = useState<string>("")
  const [gemini_api_key, setGeminiKey] = useState<string>("")

  useEffect(() => {
    let ignore = false
    async function getProfile() {
      setLoading(true)
      const { data, error } = await supabase
        .from("profiles")
        .select(`username, website, avatar_url, openrouter_api_key, gemini_api_key`)
        .eq("id", user.id)
        .single()

      if (!ignore) {
        if (error) {
          console.warn(error)
        } else if (data) {
          setUsername(data.username ?? "")
          setWebsite(data.website ?? "")
          setAvatarUrl(data.avatar_url)
          setOpenRouterKey(data.openrouter_api_key ?? "")
          setGeminiKey(data.gemini_api_key ?? "")
        }
      }
      setLoading(false)
    }
    getProfile()
    return () => { ignore = true }
  }, [user])

  async function updateProfile(event: React.FormEvent, avatarUrl?: string | null) {
    event.preventDefault()
    setLoading(true)

    const updates = {
      id: user.id,
      username,
      website,
      avatar_url: avatarUrl ?? avatar_url,
      openrouter_api_key,
      gemini_api_key,
      updated_at: new Date(),
    }

    const { error } = await supabase.from("profiles").upsert(updates)
    if (error) {
      alert(error.message)
    } else {
      if (avatarUrl) setAvatarUrl(avatarUrl)
      // Optional: Add a "Success" toast here
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header Section */}
        <div className="bg-indigo-600 p-6 text-center">
        <div className="flex justify-center -mb-16 relative z-10">
  <div className="p-1 bg-white rounded-full shadow-lg overflow-hidden w-[120px] h-[120px]">
     <Avatar
      url={avatar_url}
      size={120}
      onUpload={(event, url) => updateProfile(event, url)}
    />
  </div>
</div>
        </div>

        <form onSubmit={updateProfile} className="pt-16 p-8 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-gray-800">Account Settings</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          <hr className="border-gray-100" />

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Display Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <UserIcon size={16} />
                </span>
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-800"
                  placeholder="Your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Website</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Globe size={16} />
                </span>
                <input
                  type="url"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-800"
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">API Configuration</p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">OpenRouter Key</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Key size={14} />
                    </span>
                    <input
                      type="password"
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                      placeholder="sk-or-..."
                      value={openrouter_api_key}
                      onChange={(e) => setOpenRouterKey(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Gemini Key</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Key size={14} />
                    </span>
                    <input
                      type="password"
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                      placeholder="AIza..."
                      value={gemini_api_key}
                      onChange={(e) => setGeminiKey(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              <Save size={18} />
              {loading ? "Updating..." : "Save Changes"}
            </button>
            
            <button
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-600 font-medium py-2 rounded-lg border border-gray-200 transition-colors"
              type="button"
              onClick={() => supabase.auth.signOut()}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}