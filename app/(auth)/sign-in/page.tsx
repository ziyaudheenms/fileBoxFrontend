"use client"
import React from 'react'
import { useState } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useAuth } from "@clerk/nextjs";

import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import axios from 'axios'
import { error } from 'console'

function page() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isLoaded, signIn, setActive } = useSignIn()
  const router = useRouter();

  const { getToken } = useAuth();

  const handleSignIn = async () => {
    setIsLoading(true);

    try {
      const signInAttempt = await signIn?.create({
        identifier: email,
        password: password
      })

      if (signInAttempt?.status === "complete") {
        await setActive?.({
          session: signInAttempt.createdSessionId
        })
        toast.success("Successfully Logged In to your account!")
        const jwtToken = await getToken();
        console.log(jwtToken);
        
        axios
          .post(
            `${process.env.NEXT_PUBLIC_DOMAIN}/api/v1/auth/updateUser/`,
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
            console.log("User logged in info updated successfully:", res.data);
            router.push("/");
          })
          .catch((error: any) => {
            console.error("Error updating user logged in info:", error);
          })
      }

      else {
        toast.error("Sign in not complete. Please try again.")
      }


    } catch (error: any) {
      // handle error
      console.error(error.errors[0]?.longMessage);
      toast.error(error.errors[0]?.longMessage || "Something went wrong during sign up.");
    }
    finally {
      setIsLoading(false)
    }
  };


  return (
    <>
      <div className='p-5 flex justify-center items-center mx-auto gap-6 '>
        <div className='w-[50%] h-screen flex flex-col justify-center items-center '>
          <h1 className='font-sans text-4xl font-bold text-center'>Sign In To Your Account</h1>
          <h2 className='text-neutral-400 text-sans'>Sign In and Experience The Future of File Management</h2>
          <div className=' flex flex-col gap-4 mt-3 p-5 w-[70%] '>
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
                  onClick={handleSignIn}
                >
                  {
                    isLoading ? (
                      <Spinner className='text-center size-7' />
                    ) : ("Sign In")
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='w-[50%] bg-red-200 h-screen'>
          je
        </div>
      </div>
    </>
  )
}

export default page