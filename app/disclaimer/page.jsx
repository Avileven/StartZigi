// app/disclaimer/page.jsx
import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <main className="max-w-3xl mx-auto p-8 text-gray-800 space-y-4">
      <h1 className="text-3xl font-bold">Disclaimer</h1>

      <p>
        StartZig is a <strong>simulation platform</strong> designed for educational,
        experimental, and entertainment purposes only.
      </p>

      <p>
        Any currency, valuations, investments, scoring, “funding,” or progress indicators
        shown on the platform are <strong>virtual</strong> and do not represent real money,
        real securities, real financial instruments, or actual investment outcomes.
      </p>

      <p>
        StartZig does not provide financial, legal, tax, or investment advice. Nothing on
        this platform should be interpreted as a recommendation to buy, sell, or hold any
        asset, or to take any business, legal, or financial action.
      </p>

      <p>
        You are responsible for the content you submit. Do not upload confidential
        information, sensitive personal data, or third-party material you do not have the
        right to share.
      </p>

      <p>
        We may update the platform, its features, or this disclaimer at any time. By using
        StartZig, you agree to use the platform at your own risk.
      </p>

      <p className="pt-4">
        <Link href="/" className="text-indigo-700 font-medium hover:underline">
          Back to Home
        </Link>
      </p>
    </main>
  );
}


