import SignUpForm from "@/components/forms/sign-up"

export default function SignUp(){
    return(
         <div className="p-4 min-h-screen w-full flex flex-col items-center justify-center">
                  <div className='flex flex-col space-y-4'>
                    <h1 className='text-center'>Teijin Tool management Registration</h1>
                    <SignUpForm/>
                </div>
            </div>
    )
}