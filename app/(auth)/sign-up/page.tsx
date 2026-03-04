"use client"
import React from 'react'
import { useState } from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import axios from 'axios'
function page() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { getToken } = useAuth();

  const handleSignUp = async () => {
    setIsLoading(true);

    try {
      await signUp?.create({
        firstName: firstName,
        lastName: lastName,
        username: username,
        emailAddress: email,
        password: password,
      })

      await signUp?.prepareEmailAddressVerification({
        strategy: 'email_code'
      })


      setIsVerifying(true)
    } catch (error: any) {
      // handle error
      console.error(error.errors[0]?.longMessage);
      toast.error(error.errors[0]?.longMessage || "Something went wrong during sign up.");
    }
    finally {
      setIsLoading(false)
    }
  };


  const handleVerification = async () => {
    setIsLoading(true);
    console.log('Verification code entered:', verifyCode);
    toast.info("Verify with the OTP send to your email address.")
    try{
      const signUpAttempt = await signUp?.attemptEmailAddressVerification({
        code: verifyCode,
      })

      if (signUpAttempt?.status === 'complete'){
        await setActive?.({
          session: signUpAttempt?.createdSessionId,
        })
        toast.success("Sign-up successful! Welcome aboard.")
        const jwtToken = await getToken();

        axios
          .post(
            `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/auth/createUser/`,
            {},
            {
              headers: {
                // Headers are nested under the 'headers' key
                authorization: `Bearer ${jwtToken}`,
                'Content-Type': 'application/json' 
              },
            }
          )
          .then((res) => {
            console.log("User created successfully:", res.data);
            router.push("/dashboard");
          })
          .catch((error: any) => {
            console.error("Error creating user:", error);
          })
        router.push('/')
      }else {
        console.error('Sign-up attempt not complete:', signUpAttempt)
        console.error('Sign-up attempt status:', signUpAttempt?.status)
      }
    } catch (err : any){
        console.error(err.errors[0]?.longMessage)
        toast.error(err.errors[0]?.longMessage || "Something went wrong during verification.");
    } finally {
      setIsLoading(false)
    }
  }


  if (isVerifying) {
    return (
      <>
        <div className='p-5 flex justify-center items-center mx-auto gap-6 '>
          <div className='w-[50%] h-screen flex flex-col justify-center items-center '>
            <h1 className='font-sans text-4xl font-bold text-center'>We Ensure Security</h1>
            <h2 className='text-neutral-400 text-sans'>Secured the Process With Email Verification</h2>
            <div className=' flex flex-col gap-4 mt-3 p-5 w-[70%] '>
              <div>
                <div className='flex flex-col gap-2 '>
                  <label htmlFor="Verify Code" className='text-xl ml-2 font-medium'>Verify Code</label>
                  <input
                    type="text"
                    id="Verify Code"
                    className='border border-neutral-200 rounded-4xl p-2 outline-0 w-full font-normal text-neutral-400'
                    placeholder='enter your verify code'
                    value={verifyCode}
                    onChange={e => setVerifyCode(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <div className='flex flex-col gap-2 mt-4'>
                  <div
                    className='bg-black p-2 rounded-4xl text-white flex justify-center text-center hover:cursor-pointer hover:opacity-80 text-lg font-sans'
                    onClick={handleVerification}
                  >
                    {
                      isLoading ? (
                        <Spinner className='text-center size-7'/>
                      ) : (
                        "Verify Code"
                      )
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='w-[50%] bg-teal-200 h-screen'>
            je
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className='p-5 flex justify-center items-center mx-auto gap-6 '>
        <div className='w-[50%] h-screen flex flex-col justify-center items-center '>
          <h1 className='font-sans text-4xl font-bold text-center'>Create Your Account</h1>
          <h2 className='text-neutral-400 text-sans'>Get Your Account and Experience The Future of File Management</h2>
          <div className=' flex flex-col gap-4 mt-3 p-5 w-[70%] '>
            <div className='w-ful flex gap-2'>
              <div className='flex flex-col gap-2 w-1/2'>
                <label htmlFor="FirstName" className='text-xl ml-2 font-medium'>First Name</label>
                <input
                  type="text"
                  id="FirstName"
                  className='border border-neutral-200 rounded-4xl p-2 outline-0 w-full font-normal text-neutral-400'
                  placeholder='enter your first name'
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
              </div>
              <div className='flex flex-col gap-2 w-1/2'>
                <label htmlFor="LastName" className='text-xl ml-2 font-medium'>Last Name</label>
                <input
                  type="text"
                  id="LastName"
                  className='border border-neutral-200 rounded-4xl p-2 outline-0 w-full font-normal text-neutral-400'
                  placeholder='enter your last name'
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className='flex flex-col gap-2 '>
                <label htmlFor="Username" className='text-xl ml-2 font-medium'>Username</label>
                <input
                  type="text"
                  id="Username"
                  className='border border-neutral-200 rounded-4xl p-2 outline-0 w-full font-normal text-neutral-400'
                  placeholder='enter your username'
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div>
              <div className='flex flex-col gap-2 '>
                <label htmlFor="Email" className='text-xl ml-2 font-medium'>Email</label>
                <input
                  type="email"
                  id="Email"
                  className='border border-neutral-200 rounded-4xl p-2 outline-0 w-full font-normal text-neutral-400'
                  placeholder='enter your email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className='flex flex-col gap-2 '>
                <label htmlFor="Password" className='text-xl ml-2 font-medium'>Password</label>
                <input
                  type="password"
                  id="Password"
                  className='border border-neutral-200 rounded-4xl p-2 outline-0 w-full font-normal text-neutral-400'
                  placeholder='enter your password'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <div className='flex flex-col gap-2 mt-4'>
                <div id="clerk-captcha" />
                <div
                  className='bg-black p-2 rounded-4xl text-white text-center flex justify-center hover:cursor-pointer hover:opacity-80 text-lg font-sans'
                  onClick={handleSignUp}
                >
                  {
                    isLoading ? (
                      <Spinner className='text-center size-7'/>
                    ) : ("Sign Up")
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='w-[50%] bg-teal-200 h-screen'>
          je
        </div>
      </div>
    </>
  )
}

export default page