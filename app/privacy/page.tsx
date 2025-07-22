export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <h1 className="text-xl font-bold">Privacy Policy</h1>
        </div>
      </header>

      <main className="container py-8 max-w-4xl">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Privacy Policy</h1>

          <h2>Zero-PII Guarantee</h2>
          <p>
            Cultural AI Concierge is committed to protecting your privacy. We operate under a Zero-PII (Personally
            Identifiable Information) guarantee, which means:
          </p>
          <ul>
            <li>We never store your name, email, or personal identifiers</li>
            <li>We only store taste entities and hashed session IDs</li>
            <li>All conversations are processed in memory and not permanently stored</li>
            <li>Your cultural preferences are anonymized and cannot be traced back to you</li>
          </ul>

          <h2>Data We Collect</h2>
          <p>We collect only the following non-personal data:</p>
          <ul>
            <li>Cultural preferences (films, cuisines, destinations you select)</li>
            <li>Anonymized usage patterns for improving recommendations</li>
            <li>Technical data for performance optimization</li>
          </ul>

          <h2>GDPR & CCPA Compliance</h2>
          <p>
            We are fully compliant with GDPR and CCPA regulations. Since we don't store personal data, there's nothing
            to delete or export. However, you can:
          </p>
          <ul>
            <li>Clear your browser data to remove local preferences</li>
            <li>Contact us for any privacy-related questions</li>
            <li>Request information about our data practices</li>
          </ul>

          <h2>Third-Party Services</h2>
          <p>We use the following services that may process data:</p>
          <ul>
            <li>
              <strong>Qloo API:</strong> For cultural recommendations (anonymized queries only)
            </li>
            <li>
              <strong>OpenAI:</strong> For conversational AI (no personal data shared)
            </li>
            <li>
              <strong>Vercel:</strong> For hosting and analytics (anonymized metrics only)
            </li>
          </ul>

          <h2>Contact</h2>
          <p>For any privacy-related questions, please contact us at privacy@culturalai.com</p>

          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </main>
    </div>
  )
}
