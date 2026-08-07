import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/ui'
import { getStoreSettings, saveStoreSettings, getUserContext } from '@/services/storage'

export default function AdminTheme() {
  const context = useOutletContext() || {}
  const baseSettings = context.settings && context.settings.primaryColor ? context.settings : {};
  const initialSettings = {
    storeName: '',
    logoUrl: '',
    announcementText: '',
    stickyNav: true,
    primaryColor: '#4f46e5',
    buttonRadius: 'rounded',
    headerLayout: 'left',
    fontFamily: 'Inter',
    heroLayout: 'cinematic',
    heroImage: '',
    heroOpacity: '60',
    heroTitle: 'Crafted with intention, built to last.',
    heroSubtitle: 'Carefully curated essentials for everyday living — from wardrobe to workspace.',
    heroButtonText: 'Shop Collection',
    cardStyle: '3d',
    defaultView: 'grid',
    footerText: '',
    socialInstagram: '',
    socialTwitter: '',
    socialTiktok: '',
    ...baseSettings
  }
  
  const [settings, setSettings] = useState(initialSettings)
  const [saving, setSaving] = useState(false)
  const [iframeReady, setIframeReady] = useState(false)
  const user = getUserContext()

  // Delay iframe load to avoid deadlocking the single-threaded PHP server
  useEffect(() => {
    const t = setTimeout(() => setIframeReady(true), 2000)
    return () => clearTimeout(t)
  }, [])

  // Send postMessage to iframe whenever settings change
  useEffect(() => {
    const iframe = document.getElementById('storefront-preview')
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'THEME_UPDATE', settings }, '*')
    }
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    await saveStoreSettings(settings, user.id)
    setSaving(false)
  }

  const fonts = ['Inter', 'Roboto', 'Playfair Display', 'Merriweather', 'Space Grotesk']
  const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#0ea5e9', '#14b8a6', '#000000']

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-zinc-950">
      {/* Editor Panel */}
      <div className="w-[380px] bg-zinc-900 border-r border-zinc-800 flex flex-col relative z-10 shadow-2xl">
        {/* Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="font-bold text-white font-display">Theme Editor</h2>
            <p className="text-xs text-white/50 font-mono">Live customizing {user.subdomain}</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="h-8 text-xs px-4">
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>

        {/* Scrollable controls */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="space-y-8">
            
            {/* Header Settings */}
            <section>
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Header Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/80 block mb-2">Store Name</label>
                  <input 
                    type="text"
                    placeholder="Leave empty to use subdomain"
                    value={settings.storeName || ''}
                    onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-2">Logo Image URL</label>
                  <input 
                    type="text"
                    placeholder="https://... (Optional)"
                    value={settings.logoUrl || ''}
                    onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-2">Announcement Bar</label>
                  <input 
                    type="text"
                    placeholder="e.g. Free shipping on orders over $50"
                    value={settings.announcementText || ''}
                    onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-2">Header Layout</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSettings({ ...settings, headerLayout: 'left' })}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border ${settings.headerLayout === 'left' ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/50 hover:bg-white/5'}`}
                    >
                      Left Aligned
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, headerLayout: 'center' })}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border ${settings.headerLayout === 'center' ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/50 hover:bg-white/5'}`}
                    >
                      Center Aligned
                    </button>
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-white/80 mt-4">
                    <input 
                      type="checkbox" 
                      checked={settings.stickyNav} 
                      onChange={(e) => setSettings({...settings, stickyNav: e.target.checked})} 
                      className="rounded border-zinc-700 bg-zinc-900/50 text-shop-primary focus:ring-shop-primary/20"
                    />
                    Sticky Navigation
                  </label>
                </div>
              </div>
            </section>

            <hr className="border-zinc-800/50" />

            {/* Colors & Styles */}
            <section>
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Colors & Styles</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-white/80 block mb-2">Primary Accent</label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map(c => (
                      <button
                        key={c}
                        onClick={() => setSettings({ ...settings, primaryColor: c })}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${settings.primaryColor === c ? 'scale-110 border-white' : 'border-transparent hover:scale-105'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-2">Button Style</label>
                  <div className="flex gap-2">
                    {['sharp', 'rounded', 'pill'].map(style => (
                      <button
                        key={style}
                        onClick={() => setSettings({ ...settings, buttonRadius: style })}
                        className={`flex-1 py-2 text-xs font-medium border capitalize ${settings.buttonRadius === style ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/50 hover:bg-white/5'} ${style === 'pill' ? 'rounded-full' : style === 'rounded' ? 'rounded-md' : 'rounded-none'}`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-zinc-800/50" />

            {/* Typography */}
            <section>
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Typography</h3>
              <div>
                <label className="text-sm text-white/80 block mb-2">Heading Font</label>
                <select 
                  value={settings.fontFamily}
                  onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20"
                >
                  {fonts.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </section>

            <hr className="border-zinc-800/50" />

            {/* Hero Section */}
            <section>
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Hero Section</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/80 block mb-2">Hero Layout</label>
                  <select 
                    value={settings.heroLayout}
                    onChange={(e) => setSettings({ ...settings, heroLayout: e.target.value })}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20"
                  >
                    <option value="cinematic">Cinematic Carousel</option>
                    <option value="static">Static Image</option>
                    <option value="minimalist">Minimalist (No Image)</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>

                {settings.heroLayout === 'static' && (
                  <div>
                    <label className="text-sm text-white/80 block mb-2">Hero Image URL</label>
                    <input 
                      type="text"
                      placeholder="https://..."
                      value={settings.heroImage || ''}
                      onChange={(e) => setSettings({ ...settings, heroImage: e.target.value })}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20"
                    />
                  </div>
                )}

                {(settings.heroLayout === 'cinematic' || settings.heroLayout === 'static') && (
                  <div>
                    <label className="text-sm text-white/80 flex justify-between mb-2">
                      Overlay Opacity <span>{settings.heroOpacity}%</span>
                    </label>
                    <input 
                      type="range"
                      min="0" max="100" step="5"
                      value={settings.heroOpacity || '60'}
                      onChange={(e) => setSettings({ ...settings, heroOpacity: e.target.value })}
                      className="w-full accent-shop-primary"
                    />
                  </div>
                )}

                {settings.heroLayout !== 'hidden' && (
                  <>
                    <div>
                      <label className="text-sm text-white/80 block mb-2">Headline</label>
                      <textarea 
                        value={settings.heroTitle}
                        onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 resize-none h-20"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-white/80 block mb-2">Subtitle</label>
                      <textarea 
                        value={settings.heroSubtitle}
                        onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 resize-none h-20"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-white/80 block mb-2">Button Text</label>
                      <input 
                        type="text"
                        value={settings.heroButtonText || 'Shop Collection'}
                        onChange={(e) => setSettings({ ...settings, heroButtonText: e.target.value })}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20"
                      />
                    </div>
                  </>
                )}
              </div>
            </section>

            <hr className="border-zinc-800/50" />

            {/* Product Display */}
            <section>
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Product Display</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/80 block mb-2">Product Card Style</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSettings({ ...settings, cardStyle: '3d' })}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border ${settings.cardStyle !== 'flat' ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/50 hover:bg-white/5'}`}
                    >
                      3D Interactive
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, cardStyle: 'flat' })}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border ${settings.cardStyle === 'flat' ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/50 hover:bg-white/5'}`}
                    >
                      Flat & Minimal
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-2">Default Layout</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSettings({ ...settings, defaultView: 'grid' })}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border ${settings.defaultView !== 'list' ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/50 hover:bg-white/5'}`}
                    >
                      Grid View
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, defaultView: 'list' })}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border ${settings.defaultView === 'list' ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/50 hover:bg-white/5'}`}
                    >
                      List View
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-zinc-800/50" />

            {/* Footer & Socials */}
            <section>
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Footer & Socials</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/80 block mb-2">Copyright Text</label>
                  <input 
                    type="text"
                    placeholder="e.g. © 2026 My Brand"
                    value={settings.footerText || ''}
                    onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-2">Instagram URL</label>
                  <input 
                    type="text"
                    placeholder="https://instagram.com/..."
                    value={settings.socialInstagram || ''}
                    onChange={(e) => setSettings({ ...settings, socialInstagram: e.target.value })}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-2">X (Twitter) URL</label>
                  <input 
                    type="text"
                    placeholder="https://x.com/..."
                    value={settings.socialTwitter || ''}
                    onChange={(e) => setSettings({ ...settings, socialTwitter: e.target.value })}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 block mb-2">TikTok URL</label>
                  <input 
                    type="text"
                    placeholder="https://tiktok.com/@..."
                    value={settings.socialTiktok || ''}
                    onChange={(e) => setSettings({ ...settings, socialTiktok: e.target.value })}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20"
                  />
                </div>
              </div>
            </section>
            
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="flex-1 bg-zinc-950/80 p-6 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-4 left-4 text-xs font-mono text-white/40">Live Preview</div>
        <div className="w-full h-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-800 flex flex-col">
          <div className="h-8 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
            <div className="ml-4 text-xs text-white/30 font-mono bg-zinc-950 px-4 py-0.5 rounded-full">
              {user.subdomain}.ownstore.com
            </div>
          </div>
          {iframeReady ? (
            <iframe 
              id="storefront-preview"
              src={`/store/${user.subdomain}`} 
              className="w-full flex-1 border-none"
              title="Storefront Preview"
              onLoad={() => {
                // Send initial settings once loaded
                const iframe = document.getElementById('storefront-preview')
                if (iframe && iframe.contentWindow) {
                  iframe.contentWindow.postMessage({ type: 'THEME_UPDATE', settings }, '*')
                }
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-black/50">
              <div className="w-8 h-8 rounded-full border-4 border-black/10 border-t-black/50 animate-spin"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
