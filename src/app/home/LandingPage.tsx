import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-[#111b21]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#d1d7db]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#25D366] rounded-xl flex items-center justify-center shadow-lg shadow-[#25D366]/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-[#111b21]">SME Automator</span>
            </div>
            
            <nav className="hidden md:flex gap-8">
              <a href="#features" className="text-[#54656f] hover:text-[#128C7E] font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-[#54656f] hover:text-[#128C7E] font-medium transition-colors">How it Works</a>
            </nav>

            <div className="flex items-center gap-4">
              <Link href="/login" className="text-[#54656f] hover:text-[#111b21] font-medium hidden sm:block transition-colors">
                Log In
              </Link>
              <Link href="/login" className="bg-[#25D366] hover:bg-[#1ebe5a] text-white px-6 py-2.5 rounded-full font-medium shadow-md shadow-[#25D366]/20 transition-all hover:shadow-lg hover:-translate-y-0.5">
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,#f0f2f5_100%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e9fbee] border border-[#25D366]/20">
                <span className="flex h-2 w-2 rounded-full bg-[#25D366]"></span>
                <span className="text-sm font-semibold text-[#128C7E]">Official Meta Business Partner</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-[#111b21] leading-[1.1]">
                Automate Your WhatsApp Sales in <span className="text-[#25D366]">5 Minutes</span>
              </h1>
              <p className="text-xl text-[#54656f] max-w-lg leading-relaxed">
                Turn your WhatsApp into a revenue engine. Zero coding or technical knowledge required. We handle the complexity so you can focus on growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/login" className="inline-flex justify-center items-center bg-[#25D366] hover:bg-[#1ebe5a] text-white text-lg px-8 py-4 rounded-full font-semibold shadow-xl shadow-[#25D366]/25 transition-all hover:-translate-y-1">
                  Get Started for Free
                </Link>
                <a href="#features" className="inline-flex justify-center items-center bg-white text-[#111b21] border border-[#d1d7db] hover:border-[#111b21] hover:bg-gray-50 text-lg px-8 py-4 rounded-full font-medium transition-all">
                  View Features
                </a>
              </div>
              <p className="text-sm text-[#54656f] font-medium pt-2">✓ No credit card required &nbsp; ✓ 14-day free trial</p>
            </div>
            
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="relative rounded-2xl bg-white shadow-2xl shadow-[#111b21]/10 border border-[#d1d7db]/40 p-2 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#25D366]/10 to-transparent rounded-2xl"></div>
                <div className="aspect-[4/3] rounded-xl bg-[#f8f9fa] overflow-hidden border border-[#d1d7db]/20 flex flex-col">
                  {/* Mockup Top Bar */}
                  <div className="h-12 border-b border-[#d1d7db]/30 flex items-center px-4 gap-4 bg-white">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-[#25D366]"></div>
                    </div>
                    <div className="h-6 flex-1 bg-[#f0f2f5] rounded-md"></div>
                  </div>
                  {/* Mockup Content */}
                  <div className="flex-1 p-6 flex gap-6 relative overflow-hidden bg-[#f0f2f5]">
                    {/* Mock sidebar */}
                    <div className="w-1/4 space-y-3">
                      <div className="h-8 bg-white rounded-md shadow-sm"></div>
                      <div className="h-8 bg-white/60 rounded-md"></div>
                      <div className="h-8 bg-white/60 rounded-md"></div>
                    </div>
                    {/* Mock main area */}
                    <div className="flex-1 space-y-4">
                      <div className="h-10 w-1/3 bg-white rounded-md shadow-sm"></div>
                      <div className="flex gap-4">
                        <div className="h-24 w-1/3 bg-white rounded-lg shadow-sm border border-[#25D366]/20"></div>
                        <div className="h-24 w-1/3 bg-white rounded-lg shadow-sm"></div>
                        <div className="h-24 w-1/3 bg-white rounded-lg shadow-sm"></div>
                      </div>
                      <div className="h-48 bg-white rounded-lg shadow-sm border border-[#d1d7db]/40 flex flex-col p-4 gap-3">
                         <div className="h-6 w-1/4 bg-[#f0f2f5] rounded"></div>
                         <div className="h-8 bg-[#f0f2f5] rounded mt-2"></div>
                         <div className="h-8 bg-[#f0f2f5] rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#00a884] rounded-full blur-3xl opacity-20"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#34B7F1] rounded-full blur-3xl opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition (Features Grid) */}
      <section id="features" className="py-24 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#111b21] mb-4">Everything you need to scale WhatsApp</h2>
            <p className="text-lg text-[#54656f]">Powerful features designed specifically for small businesses. Setup takes minutes, not months.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#d1d7db]/40 hover:shadow-xl hover:border-[#25D366]/30 transition-all group">
              <div className="w-14 h-14 bg-[#e9fbee] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-[#128C7E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-[#111b21] mb-3">Smart Auto-Replies</h3>
              <p className="text-[#54656f] leading-relaxed">Never miss a customer inquiry. Instantly reply to FAQs, pricing requests, and bookings 24/7 automatically.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#d1d7db]/40 hover:shadow-xl hover:border-[#34B7F1]/30 transition-all group">
              <div className="w-14 h-14 bg-[#e1f5fe] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-[#34B7F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-[#111b21] mb-3">Unified Team Inbox</h3>
              <p className="text-[#54656f] leading-relaxed">Manage all WhatsApp chats in one place. Collaborate with your team, assign conversations, and resolve issues faster.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#d1d7db]/40 hover:shadow-xl hover:border-[#00a884]/30 transition-all group">
              <div className="w-14 h-14 bg-[#e6f6f4] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-[#00a884]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-[#111b21] mb-3">Mini CRM</h3>
              <p className="text-[#54656f] leading-relaxed">Save customer details instantly. Organize contacts, track preferences, and build stronger relationships without leaving the app.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#111b21] mb-4">Up and running in 3 simple steps</h2>
            <p className="text-lg text-[#54656f]">It's so easy, you'll wonder why you didn't do it sooner.</p>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop only) */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-[#e9fbee] via-[#25D366] to-[#e9fbee] z-0"></div>

            <div className="grid md:grid-cols-3 gap-12 relative z-10">
              {/* Step 1 */}
              <div className="text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-white rounded-full border-4 border-[#25D366] flex items-center justify-center shadow-xl shadow-[#25D366]/10 mb-6 text-2xl font-bold text-[#111b21]">1</div>
                <h3 className="text-xl font-bold text-[#111b21] mb-3">Connect Meta</h3>
                <p className="text-[#54656f]">Link your WhatsApp Business account securely with a single click.</p>
              </div>

              {/* Step 2 */}
              <div className="text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-[#25D366] rounded-full border-4 border-white flex items-center justify-center shadow-xl shadow-[#25D366]/30 mb-6 text-2xl font-bold text-white">2</div>
                <h3 className="text-xl font-bold text-[#111b21] mb-3">Pick a Template</h3>
                <p className="text-[#54656f]">Choose from pre-built automation rules tailored for your industry.</p>
              </div>

              {/* Step 3 */}
              <div className="text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-white rounded-full border-4 border-[#25D366] flex items-center justify-center shadow-xl shadow-[#25D366]/10 mb-6 text-2xl font-bold text-[#111b21]">3</div>
                <h3 className="text-xl font-bold text-[#111b21] mb-3">Watch Sales Grow</h3>
                <p className="text-[#54656f]">Sit back as SME Automator engages customers and closes deals.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA & Footer */}
      <section className="bg-[#111b21] text-white pt-24 pb-12 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-3xl pointer-events-none">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-96 h-96 bg-[#25D366] rounded-full blur-[128px] opacity-20"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 mb-24">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">Ready to transform your business?</h2>
          <p className="text-xl text-[#8696a0] mb-10 max-w-2xl mx-auto">Join thousands of SMEs using our platform to save time, engage customers, and increase sales.</p>
          <Link href="/login" className="inline-flex justify-center items-center bg-[#25D366] hover:bg-[#1ebe5a] text-white text-xl px-10 py-5 rounded-full font-bold shadow-[0_0_40px_rgba(37,211,102,0.4)] hover:shadow-[0_0_60px_rgba(37,211,102,0.6)] transition-all hover:-translate-y-1">
            Join Now - Start Free
          </Link>
          <p className="mt-6 text-[#8696a0] text-sm">Setup takes less than 5 minutes. Cancel anytime.</p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 border-t border-[#2a3942] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#25D366]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <span className="font-bold tracking-tight">SME Automator</span>
          </div>
          <p className="text-[#8696a0] text-sm">&copy; {new Date().getFullYear()} SME Automator. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-[#8696a0]">
            <a href="#features" className="hover:text-white transition-colors">Privacy</a>
            <a href="#features" className="hover:text-white transition-colors">Terms</a>
            <a href="#features" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </section>
    </div>
  );
}
