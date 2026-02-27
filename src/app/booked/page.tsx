export default function BookedPage() {
  return (
    <div className="mx-auto max-w-2xl py-24 text-center">
      <h1 className="text-4xl font-semibold">You're booked 🎉</h1>

      <p className="mt-6 text-lg text-gray-700">
        Your Product Clarity Call is confirmed.
      </p>

      <p className="mt-4 text-gray-600">
        You’ll receive a calendar invite and preparation notes by email.
      </p>

      <div className="mt-10 rounded-2xl border border-black/10 p-6">
        <div className="font-semibold">
          What to prepare (optional)
        </div>

        <ul className="mt-4 space-y-2 text-gray-700">
          <li>• A quick description of your product</li>
          <li>• The biggest problem you're facing right now</li>
          <li>• Any existing screens or prototype (if you have)</li>
        </ul>
      </div>

      <a
        href="/"
        className="mt-10 inline-block rounded-2xl bg-black px-7 py-3 font-semibold text-white hover:opacity-90"
      >
        Back to homepage
      </a>
    </div>
  );
}