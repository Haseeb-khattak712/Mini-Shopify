const fs = require('fs')

const storefrontFile = 'd:/Projects/Store-Kit/src/pages/Storefront.jsx'
let storefrontCode = fs.readFileSync(storefrontFile, 'utf8')

const newCartCheckout = `
export function CartCheckout() {
  const navigate = useNavigate();
  const { subdomain } = useParams();
  const { cart, setCart } = useOutletContext();
  const customer = getUserContext();
  const theme = useStoreTheme();

  const [step, setStep] = useState('cart'); // cart -> form -> processing
  const [email, setEmail] = useState(customer?.email || '');
  const [address, setAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(null);
  const [promoError, setPromoError] = useState('');

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shipping = subtotal >= 100 ? 0 : 8;
  const total = subtotal + shipping;

  let finalTotal = total;
  if (discount) {
    if (discount.type === 'percentage') {
      finalTotal = finalTotal - (finalTotal * (discount.value / 100));
    } else if (discount.type === 'fixed') {
      finalTotal = Math.max(0, finalTotal - discount.value);
    }
  }

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoError('');
    try {
      const { validateDiscount } = await import('@/services/storage');
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
  };

  const handleCardFormat = (e) => {
    const val = e.target.value.replace(/\\D/g, '');
    const formatted = val.match(/.{1,4}/g)?.join(' ') || '';
    setCardNumber(formatted.substring(0, 19));
  };

  const handleExpiryFormat = (e) => {
    const val = e.target.value.replace(/\\D/g, '');
    if (val.length > 2) {
      setExpiry(val.substring(0, 2) + '/' + val.substring(2, 4));
    } else {
      setExpiry(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStep('processing');
    
    const { addOrder } = await import('@/services/storage');
    
    const newOrder = {
      id: \`ORD-\${Date.now()}\`,
      customer_id: customer?.id || null,
      customer: address ? address.split(',')[0] : (customer?.name || 'Guest User'),
      email: email,
      total: finalTotal,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      items: cart.map(i => ({ product_id: i.product.id, name: i.product.name, quantity: i.quantity, price: i.product.price, size: i.size, color: i.color }))
    };
    
    // Simulate API call to Stripe
    setTimeout(async () => {
      const res = await addOrder(newOrder, null, subdomain);
      setCart([]);
      navigate(\`/store/\${subdomain}/confirmation\`, { state: { orderId: res.id, pastCart: cart, pastTotal: finalTotal } });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 transition-colors storefront-theme">
      <style>{\`
        .storefront-theme {
          --color-shop-primary: \${theme.primaryColor};
          --color-shop-accent: \${theme.primaryColor};
          --font-display: '\${theme.fontFamily}', system-ui, sans-serif;
          --radius-button: \${theme.buttonRadius === 'pill' ? '9999px' : theme.buttonRadius === 'sharp' ? '0px' : '0.5rem'};
        }
        .storefront-theme h1, .storefront-theme h2, .storefront-theme h3 {
          font-family: var(--font-display) !important;
        }
        .storefront-theme button, .storefront-theme .btn {
          border-radius: var(--radius-button) !important;
        }
      \`}</style>
      <StoreNav cartCount={cartCount} theme={theme} />
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        <button onClick={() => navigate(-1)} className="text-sm text-white/60 hover:text-white/90 flex items-center gap-1.5 mb-8 cursor-pointer transition-colors">
          ← Back to store
        </button>
        
        {cart.length === 0 ? (
          <div className="bg-zinc-900/50 border border-white/10 rounded-[10px] p-12 text-center transition-colors">
            <p className="text-4xl mb-4">🛒</p>
            <h2 className="font-bold font-display text-white/90 mb-2 transition-colors">Your cart is empty</h2>
            <p className="text-sm text-white/50 mb-6 transition-colors">Add some products to get started.</p>
            <Button onClick={() => navigate(-1)}>Browse products</Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
            
            {step === 'processing' && (
              <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mb-4" />
                <p className="text-zinc-900 font-semibold text-lg animate-pulse">Processing Payment...</p>
              </div>
            )}

            {/* Left Column: Order Summary */}
            <div className="w-full md:w-5/12 bg-zinc-50 p-8 border-r border-zinc-100 overflow-y-auto hidden md:block">
              <h3 className="text-lg font-bold text-zinc-900 mb-6 font-display">Order Summary</h3>
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
                      <p className="text-xs text-zinc-500 mt-1">{[item.size, item.color].filter(Boolean).join(' · ')}</p>
                    </div>
                    <p className="text-sm font-medium text-zinc-900">\${(item.product?.price * item.quantity).toFixed(2)}</p>
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
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:border-zinc-900 text-zinc-900 bg-white"
                  />
                  <button onClick={applyPromo} type="button" className="px-4 py-2 bg-zinc-900 text-white text-sm font-semibold rounded-lg hover:bg-zinc-800 transition-colors">Apply</button>
                </div>
                {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
                {discount && <p className="text-emerald-600 text-xs mt-1">Code applied successfully!</p>}
              </div>

              <div className="border-t border-zinc-200 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span>\${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Shipping</span>
                  <span>{shipping > 0 ? \`\$\${shipping.toFixed(2)}\` : 'Free'}</span>
                </div>
                {discount && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({promoCode})</span>
                    <span>-{discount.type === 'percentage' ? \`\${discount.value}%\` : \`\$\${discount.value.toFixed(2)}\`}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg text-zinc-900 pt-4 mt-2 border-t border-zinc-200">
                  <span>Total</span>
                  <span>\${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Payment Form */}
            <div className="w-full md:w-7/12 p-8 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-zinc-900 font-display">Secure Checkout</h2>
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
                          onChange={(e) => setCvc(e.target.value.replace(/\\D/g, '').substring(0, 4))}
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
                    Pay \${finalTotal.toFixed(2)}
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
          </div>
        )}
      </div>
    </div>
  );
}
`

const startIdx = storefrontCode.indexOf('export function CartCheckout() {')
const endIdx = storefrontCode.indexOf('// ── Order Confirmation ─────────────────────────────────────────────────────────')
if (startIdx === -1 || endIdx === -1) {
  console.log("Could not find boundaries")
  process.exit(1)
}

const finalCode = storefrontCode.substring(0, startIdx) + newCartCheckout + '\n' + storefrontCode.substring(endIdx)

fs.writeFileSync(storefrontFile, finalCode)
console.log("Replaced successfully")
