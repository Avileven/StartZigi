import React from 'react';

export default function TermsOfService() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="mt-12 prose prose-indigo prose-lg text-gray-700 mx-auto">
          <h2>1. Welcome to StartZig!</h2>
          <p>
            This is a simulation platform designed for educational and entertainment purposes. By using our services, you agree to these terms. Please read them carefully. All activities, achievements, and assets within StartZig, including virtual capital, valuations, and investments, are entirely simulated and hold no real-world value.
          </p>

          <h2>2. Community Guidelines and User Conduct</h2>
          <p>
            We foster a community of ambitious and respectful entrepreneurs. To maintain a safe and productive environment, you agree to:
          </p>
          <ul>
            <li>
              <strong>Be Respectful:</strong> Interact with all users, simulated investors, and platform representatives constructively and politely. Harassment, hate speech, or abusive language will not be tolerated.
            </li>
            <li>
              <strong>Provide Honest Feedback:</strong> When interacting with other ventures, provide feedback that is both honest and helpful. The goal is collective growth.
            </li>
            <li>
              <strong>No Malicious Activity:</strong> You may not attempt to exploit, disrupt, or otherwise interfere with the platform's normal operation.
            </li>
            <li>
              <strong>Original Content:</strong> You affirm that any content you upload (business plans, MVP details, etc.) is your own original work or you have the rights to use it. Do not upload infringing or illegal content.
            </li>
          </ul>

          <h2>3. Your Account</h2>
          <p>
            You are responsible for safeguarding your account. StartZig cannot and will not be liable for any loss or damage arising from your failure to comply with the above. We reserve the right to suspend or terminate accounts that violate our terms.
          </p>

          <h2>4. Disclaimer of Warranties</h2>
          <p>
            The StartZig platform is provided "as is." We make no warranties, expressed or implied, and hereby disclaim all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
          </p>
          
          <h2>5. Limitation of Liability</h2>
          <p>
            In no event shall StartZig or its suppliers be liable for any damages arising out of the use or inability to use the materials on StartZig's website, even if StartZig or a StartZig authorized representative has been notified orally or in writing of the possibility of such damage. Because this is a simulation, you acknowledge that no real financial or business loss can be incurred.
          </p>

           <h2>6. Changes to Terms</h2>
          <p>
            We may revise these terms of service for our website at any time without notice. By using this website, you are agreeing to be bound by the then-current version of these terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}