import { Link } from 'react-router-dom'
import { Button } from './ui'

function PolicyLayout({ title, children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/store" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">A</div>
            <div>
              <p className="font-semibold text-slate-900 font-display leading-none text-sm">Acme Goods Co.</p>
              <p className="text-[10px] text-slate-400 font-mono">acme-goods.storekit.com</p>
            </div>
          </Link>
          <Link to="/store">
            <Button variant="ghost" size="sm">← Back to store</Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold font-display text-slate-900 mb-8">{title}</h1>
        <div className="bg-white border border-slate-200 rounded-[12px] p-8 md:p-10 prose prose-slate prose-sm max-w-none">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 px-6 mt-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 Acme Goods Co. · Powered by <span className="text-indigo-600">StoreKit</span></p>
          <div className="flex gap-4">
            <Link to="/store/privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
            <Link to="/store/returns" className="hover:text-slate-600 transition-colors">Returns & Refunds</Link>
            <Link to="/store/contact" className="hover:text-slate-600 transition-colors">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ── Privacy Policy ──────────────────────────────────────────────────────────────

export function PrivacyPolicy() {
  return (
    <PolicyLayout title="Privacy Policy">
      <p className="text-sm text-slate-500 mb-6">Last updated: July 2026</p>

      <h2 className="text-lg font-bold font-display text-slate-900 mt-6 mb-3">1. Information We Collect</h2>
      <p className="text-sm text-slate-600 leading-relaxed mb-4">
        We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This includes your name, email address, shipping address, and payment information.
      </p>

      <h2 className="text-lg font-bold font-display text-slate-900 mt-6 mb-3">2. How We Use Your Information</h2>
      <p className="text-sm text-slate-600 leading-relaxed mb-4">
        We use the information we collect to process your orders, communicate with you about your purchases, send you promotional materials (with your consent), and improve our services. We never sell your personal data to third parties.
      </p>

      <h2 className="text-lg font-bold font-display text-slate-900 mt-6 mb-3">3. Cookies & Tracking</h2>
      <p className="text-sm text-slate-600 leading-relaxed mb-4">
        We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie preferences through your browser settings.
      </p>

      <h2 className="text-lg font-bold font-display text-slate-900 mt-6 mb-3">4. Data Security</h2>
      <p className="text-sm text-slate-600 leading-relaxed mb-4">
        We implement industry-standard security measures to protect your personal information, including SSL encryption for all data transfers and secure storage of payment information through our PCI-compliant payment processor.
      </p>

      <h2 className="text-lg font-bold font-display text-slate-900 mt-6 mb-3">5. Your Rights</h2>
      <p className="text-sm text-slate-600 leading-relaxed mb-4">
        You have the right to access, correct, or delete your personal data at any time. To exercise these rights, please contact us at <span className="text-indigo-600 font-medium">privacy@acme-goods.com</span>.
      </p>

      <div className="mt-8 p-4 bg-indigo-50 rounded-[10px] border border-indigo-100">
        <p className="text-sm text-indigo-700">
          <strong>Questions?</strong> If you have any questions about this privacy policy, please reach out to us at{' '}
          <Link to="/store/contact" className="underline font-medium">our contact page</Link>.
        </p>
      </div>
    </PolicyLayout>
  )
}

// ── Returns & Refunds ───────────────────────────────────────────────────────────

export function ReturnsRefunds() {
  return (
    <PolicyLayout title="Returns & Refunds">
      <p className="text-sm text-slate-500 mb-6">Last updated: July 2026</p>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: '📦', title: '30-Day Returns', desc: 'Return any item within 30 days of delivery' },
          { icon: '💰', title: 'Full Refund', desc: 'Get your money back, no questions asked' },
          { icon: '🚚', title: 'Free Return Shipping', desc: 'We cover return shipping on all orders' },
        ].map(item => (
          <div key={item.title} className="bg-slate-50 rounded-[10px] p-5 text-center border border-slate-100">
            <div className="text-2xl mb-2">{item.icon}</div>
            <h3 className="text-sm font-bold font-display text-slate-900 mb-1">{item.title}</h3>
            <p className="text-xs text-slate-500">{item.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-bold font-display text-slate-900 mt-6 mb-3">Return Policy</h2>
      <p className="text-sm text-slate-600 leading-relaxed mb-4">
        We want you to be completely satisfied with your purchase. If you're not happy with an item, you can return it within 30 days of delivery for a full refund. Items must be in their original condition with tags attached.
      </p>

      <h2 className="text-lg font-bold font-display text-slate-900 mt-6 mb-3">How to Initiate a Return</h2>
      <ol className="list-decimal list-inside text-sm text-slate-600 leading-relaxed mb-4 space-y-2">
        <li>Log into your account and go to your order history</li>
        <li>Select the item you'd like to return and choose a reason</li>
        <li>Print the prepaid return label we'll email to you</li>
        <li>Pack the item securely and drop it off at any shipping location</li>
      </ol>

      <h2 className="text-lg font-bold font-display text-slate-900 mt-6 mb-3">Refund Timeline</h2>
      <div className="space-y-3 mb-4">
        {[
          { step: 'Return received', time: '1–3 business days after shipping' },
          { step: 'Inspection & processing', time: '1–2 business days' },
          { step: 'Refund issued', time: 'Same day as approval' },
          { step: 'Funds in your account', time: '3–5 business days (varies by bank)' },
        ].map(item => (
          <div key={item.step} className="flex items-start gap-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
            <div>
              <span className="font-medium text-slate-800">{item.step}</span>
              <span className="text-slate-400"> — {item.time}</span>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-bold font-display text-slate-900 mt-6 mb-3">Non-Returnable Items</h2>
      <p className="text-sm text-slate-600 leading-relaxed mb-4">
        Customized or personalized items, final sale items, and gift cards are not eligible for return. Perishable goods must be reported within 24 hours of delivery.
      </p>

      <div className="mt-8 p-4 bg-amber-50 rounded-[10px] border border-amber-100">
        <p className="text-sm text-amber-800">
          <strong>Need help?</strong> If you have questions about a return, please{' '}
          <Link to="/store/contact" className="underline font-medium">contact our support team</Link>.
        </p>
      </div>
    </PolicyLayout>
  )
}

// ── Contact Us ──────────────────────────────────────────────────────────────────

export function ContactUs() {
  return (
    <PolicyLayout title="Contact Us">
      <p className="text-sm text-slate-500 mb-8">We'd love to hear from you. Reach out through any of the channels below.</p>

      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {[
          { icon: '📧', title: 'Email', detail: 'support@acme-goods.com', sub: 'We reply within 24 hours' },
          { icon: '📞', title: 'Phone', detail: '+1 (555) 123-4567', sub: 'Mon–Fri, 9am–6pm EST' },
          { icon: '💬', title: 'Live Chat', detail: 'Start a conversation', sub: 'Available during business hours' },
        ].map(item => (
          <div key={item.title} className="bg-slate-50 rounded-[10px] p-6 border border-slate-100 text-center hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors cursor-default">
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="text-sm font-bold font-display text-slate-900 mb-1">{item.title}</h3>
            <p className="text-sm text-indigo-600 font-medium mb-1">{item.detail}</p>
            <p className="text-xs text-slate-400">{item.sub}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-bold font-display text-slate-900 mb-4">Send us a message</h2>
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Full name</label>
            <input
              placeholder="Jane Doe"
              className="w-full px-3.5 py-2.5 rounded-[10px] border border-slate-200 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Email address</label>
            <input
              placeholder="jane@example.com"
              className="w-full px-3.5 py-2.5 rounded-[10px] border border-slate-200 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Subject</label>
          <select className="w-full px-3.5 py-2.5 rounded-[10px] border border-slate-200 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-600">
            <option>General Inquiry</option>
            <option>Order Support</option>
            <option>Returns & Refunds</option>
            <option>Product Question</option>
            <option>Partnership</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Message</label>
          <textarea
            rows={5}
            placeholder="Tell us how we can help..."
            className="w-full px-3.5 py-2.5 rounded-[10px] border border-slate-200 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
          />
        </div>
        <Button className="w-full md:w-auto">Send message →</Button>
      </div>

      <div className="mt-10 p-5 bg-slate-50 rounded-[10px] border border-slate-100">
        <h3 className="text-sm font-bold font-display text-slate-900 mb-2">📍 Visit us</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Acme Goods Co.<br />
          123 Commerce Street, Suite 400<br />
          San Francisco, CA 94105<br />
          United States
        </p>
      </div>
    </PolicyLayout>
  )
}
