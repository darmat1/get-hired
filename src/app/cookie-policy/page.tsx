'use client'

import { Header } from '@/components/layout/header'

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-4 text-sm text-muted-foreground">
          Last Updated: January 5, 2026
        </div>
        <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
        
        <div className="prose dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">What Are Cookies</h2>
            <p>Cookies are small pieces of data stored on your device when you visit our website. They help us remember your preferences, maintain your session, and analyze how you use our service. Some cookies are essential for the site to function, while others help us improve your experience.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Types of Cookies We Use</h2>
            <p>Essential Cookies: Required for the site to function properly (authentication, security). Analytics Cookies: Help us understand how users interact with our site. Preference Cookies: Remember your language and theme settings. Marketing Cookies: Used to track your activity and show relevant content.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How to Control Cookies</h2>
            <p>Most web browsers allow you to control cookies through their settings. You can choose to accept all cookies, refuse all cookies, or be notified when a cookie is sent. Note that disabling essential cookies may affect the functionality of our website.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
            <p>We may use third-party services that set cookies on your device, such as analytics providers and authentication services (LinkedIn, Google). These services have their own privacy policies and cookie practices.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p>We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by updating the date of this policy.</p>
          </section>
        </div>
      </main>
    </div>
  )
}
