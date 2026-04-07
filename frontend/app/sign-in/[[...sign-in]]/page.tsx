import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-900">GMVN Control Tower</h1>
          <p className="text-gray-500 text-sm mt-1">Garhwal Mandal Vikas Nigam</p>
        </div>
        <SignIn />
      </div>
    </div>
  )
}
