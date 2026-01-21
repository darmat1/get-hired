'use client'

import { Header } from '@/components/layout/header'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-4 text-sm text-muted-foreground">
          Last Updated: January 5, 2026
        </div>
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p>We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p>We collect information you provide directly (such as email, resume data, and profile information) and information collected automatically (such as log data and cookies). We may also collect information from LinkedIn when you connect your account.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">AI Processing</h2>
            <p>To provide resume generation and improvement features, we send the text data you provide to third-party AI providers (e.g., OpenAI, Groq). We do not allow these providers to use your personal data to train their models. Your data is used solely to generate resume content according to our service terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">LinkedIn Data</h2>
            <p>Data imported from LinkedIn is used solely to populate your resume. You can request the deletion of your imported LinkedIn data at any time via your account settings or by contacting support@gethired.work. We do not share your LinkedIn data with third parties except as required to generate your resume content.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p>We use your information to provide, maintain, and improve our services, to process transactions, to send you service updates, and to comply with legal obligations.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information. You can manage your preferences in your account settings or contact us for assistance.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p>If you have questions about this Privacy Policy or our privacy practices, please contact us at support@gethired.work.</p>
          </section>
        </div>
      </main>
    </div>
  )
}
