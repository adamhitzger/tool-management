import SignInForm from "@/components/forms/sign-in";

export default function Home() {
  return (
    <div className="p-4 min-h-screen w-full flex flex-col items-center justify-center">
          <div className='flex flex-col space-y-4'>
            <h1 className='text-center'>Houfek Tool management</h1>
            <SignInForm/>
        </div>
    </div>
  );
}