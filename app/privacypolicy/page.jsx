
// app/PrivacyPolicy/page.jsx
"use client";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: January 2026</p>

        <p className="mt-6 text-gray-700 leading-relaxed">
          Your privacy matters to us. This Privacy Policy explains what information StartZig collects,
          how we use it, and the choices you have.
        </p>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">1. Information We Collect</h2>
          <p className="text-gray-700 leading-relaxed">We may collect:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Email address</li>
            <li>Account identifiers</li>
            <li>Venture-related inputs (ideas, descriptions, feedback)</li>
            <li>Usage data for improving the platform</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            We do not collect payment details or sensitive financial information.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">2. How We Use Information</h2>
          <p className="text-gray-700 leading-relaxed">
            We use collected data to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Operate and maintain the platform</li>
            <li>Associate users with ventures and activities</li>
            <li>Improve user experience and features</li>
            <li>Communicate essential platform-related updates</li>
          </ul>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">3. Data Sharing</h2>
          <p className="text-gray-700 leading-relaxed">
            We do not sell your personal data.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Your data may be visible to other users depending on your platform interactions and settings.
            We may store and process data using trusted third-party infrastructure providers.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">4. Data Security</h2>
          <p className="text-gray-700 leading-relaxed">
            We implement reasonable measures to protect your data. However, no system is completely secure,
            and we cannot guarantee absolute protection.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">5. Cookies &amp; Sessions</h2>
          <p className="text-gray-700 leading-relaxed">
            StartZig may use cookies or local storage to maintain login sessions and improve navigation and usability.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">6. Your Rights</h2>
          <p className="text-gray-700 leading-relaxed">You may:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Request access to your data</li>
            <li>Request deletion of your account</li>
            <li>Update your profile information</li>
          </ul>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">7. Changes to This Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            This policy may be updated from time to time. Continued use of the platform constitutes acceptance of changes.
          </p>
        </section>

        <hr className="my-10" />

        <p className="text-sm text-gray-500">
          If you have questions about this Privacy Policy, please contact the StartZig team.
        </p>
      </div>
    </main>
  );
}
