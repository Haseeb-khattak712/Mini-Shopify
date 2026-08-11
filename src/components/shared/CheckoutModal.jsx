import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { validateDiscount } from '@/services/storage'

export function CheckoutModal({ isOpen, onClose, cart, total, onCheckoutComplete }) {
  const [step, setStep] = useState('form') // form -> processing -> success
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(null)
  const [promoError, setPromoError] = useState('')

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  
  let finalTotal = total
  if (discount) {
    if (discount.type === 'percentage') {
      finalTotal = finalTotal - (finalTotal * (discount.value / 100))
    } else if (discount.type === 'fixed') {
      finalTotal = Math.max(0, finalTotal - discount.value)
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setPromoCode('')
      setDiscount(null)
      setPromoError('')
    }
  }, [isOpen])

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoError('');
    try {
      const res = await validateDiscount(promoCode);
      if (res.valid) {
        setDiscount(res.discount);
        setPromoError('');
      } else {
        setDiscount(null);
        setPromoError(res.error || 'Invalid code');
      }
    } catch (e) {
      setPromoError('Failed to validate code');
    }
  }

  if (!isOpen) return null

  const handleCardFormat = (e) => {
    const val = e.target.value.replace(/\D/g, '')
    const formatted = val.match(/.{1,4}/g)?.join(' ') || ''
    setCardNumber(formatted.substring(0, 19))
  }

  const handleExpiryFormat = (e) => {
    const val = e.target.value.replace(/\D/g, '')
    if (val.length > 2) {
      setExpiry(val.substring(0, 2) + '/' + val.substring(2, 4))
    } else {
      setExpiry(val)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setStep('processing')
    
    // Simulate API call to Stripe
    setTimeout(() => {
      setStep('success')
      setTimeout(() => {
        onCheckoutComplete(finalTotal, email, address)
        setStep('form')
        onClose()
      }, 2000)
    }, 2500)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => step === 'form' && onClose()} />

          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          >
            {step === 'processing' && (
              <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mb-4" />
                <p className="text-zinc-900 font-semibold text-lg animate-pulse">Processing Payment...</p>
              </div>
            )}

            {step === 'success' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-2">Payment Successful!</h2>
                <p className="text-zinc-500">Your order has been confirmed.</p>
              </motion.div>
            )}

            {/* Left Column: Order Summary */}
            <div className="w-full md:w-5/12 bg-zinc-50 p-8 border-r border-zinc-100 overflow-y-auto hidden md:block">
              <h3 className="text-lg font-bold text-zinc-900 mb-6">Order Summary</h3>
              <div className="space-y-4 mb-8">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-16 h-16 bg-white rounded-xl border border-zinc-200 overflow-hidden shrink-0 relative">
                      {item.product?.image ? (
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-zinc-100" />
                      )}
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-zinc-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-zinc-900 line-clamp-2">{item.product?.name}</p>
                      <p className="text-xs text-zinc-500 mt-1">{item.size} / {item.color}</p>
                    </div>
                    <p className="text-sm font-medium text-zinc-900">${(item.product?.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-200 pt-4 mb-4">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Promo Code (e.g. SUMMER20)" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:border-zinc-900"
                  />
                  <button onClick={applyPromo} type="button" className="px-4 py-2 bg-zinc-900 text-white text-sm font-semibold rounded-lg hover:bg-zinc-800 transition-colors">Apply</button>
                </div>
                {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
                {discount && <p className="text-emerald-600 text-xs mt-1">Code applied successfully!</p>}
              </div>

              <div className="border-t border-zinc-200 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Shipping</span>
                  <span>{total > subtotal ? '$8.00' : 'Free'}</span>
                </div>
                {discount && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({promoCode})</span>
                    <span>-{discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value.toFixed(2)}`}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-500">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-zinc-900 pt-4 mt-2 border-t border-zinc-200">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Payment Form */}
            <div className="w-full md:w-7/12 p-8 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-zinc-900">Secure Checkout</h2>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-3">Contact Information</h3>
                  <input 
                    type="email" 
                    required 
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-shadow shadow-sm"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-3">Shipping Address</h3>
                  <input 
                    type="text" 
                    required 
                    placeholder="Full Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-shadow shadow-sm"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-3">Payment Details</h3>
                  <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
                    <div className="p-3 border-b border-zinc-200 relative">
                      <input 
                        type="text" 
                        required 
                        placeholder="Card number"
                        value={cardNumber}
                        onChange={handleCardFormat}
                        maxLength={19}
                        className="w-full bg-transparent text-zinc-900 text-sm focus:outline-none pl-1"
                      />
                      <div className="absolute right-3 top-3 flex gap-1">
                        <div className="w-8 h-5 bg-zinc-100 rounded flex items-center justify-center border border-zinc-200">
                          <span className="text-[10px] font-bold text-blue-600">VISA</span>
                        </div>
                        <div className="w-8 h-5 bg-zinc-100 rounded flex items-center justify-center border border-zinc-200">
                          <span className="text-[10px] font-bold text-orange-500">MC</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="w-1/2 p-3 border-r border-zinc-200">
                        <input 
                          type="text" 
                          required 
                          placeholder="MM / YY"
                          value={expiry}
                          onChange={handleExpiryFormat}
                          maxLength={5}
                          className="w-full bg-transparent text-zinc-900 text-sm focus:outline-none pl-1"
                        />
                      </div>
                      <div className="w-1/2 p-3">
                        <input 
                          type="text" 
                          required 
                          placeholder="CVC"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
                          maxLength={4}
                          className="w-full bg-transparent text-zinc-900 text-sm focus:outline-none pl-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    className="w-full bg-zinc-900 text-white font-bold text-sm py-4 rounded-xl shadow-lg hover:bg-zinc-800 transition-colors hover:shadow-xl active:scale-[0.98] transform flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Pay ${finalTotal.toFixed(2)}
                  </button>
                  <p className="text-center text-xs text-zinc-500 mt-4 flex items-center justify-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Payments are secure and encrypted.
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
