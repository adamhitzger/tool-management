import VerifyOTP from "@/components/forms/verify-otp";

export default function Verify(){
    return(
        <div className="p-4 min-h-screen w-full flex flex-col items-center justify-center">
                  <div className='flex flex-col space-y-4'>
                    <h1 className='text-center'>Zadejte kód</h1>
                    <VerifyOTP/>
                </div>
            </div>
    )
}