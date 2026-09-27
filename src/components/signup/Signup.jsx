/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

// zod schema for validation
const signUpSchema = z.object({
  name: z.string("Must be Text").
  min(3, "Name must be at least 3 characters").
  max(25, "Name must be under 25 characters")
  .regex(/^[a-zA-Z\s]+$/, "Name must contain only letters"),

  username: z.string("")
  .min(3, "username must be at least 3 characters")
  .max(25, "username must be under 25 characters")
  .regex(/^[a-z0-9]{3,15}$/, "Username must be 3-15 characters, using only lowercase letters, numbers."),

  email: z.email("Invalid Email"),

  password: z.string("Your password is not strong enough")
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be under 72 characters")
  .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/),

  rePassword: z.string(),

  dateOfBirth: z.string().refine((val) => {
  const age = (Date.now() - new Date(val).getTime()) / (1000*60*60*24*365.25);
  return age >= 13;
}, "You must be at least 13 years old"),

  gender: z.enum( ["male", "female"], "Please select your gender" )

}).refine((value) => {
  return value.password === value.rePassword
}, {
  error: "Password do not match!",
  path: ["rePassword"]
})


export default function Signup() {
  const {handleSubmit, register, getValues ,formState: {errors}} = useForm({
    defaultValues:{
      name: "",
      username: "",
      email: "",
      password: "",
      rePassword: "",
      dateOfBirth: "",
      gender: ""
    },

    resolver : zodResolver(signUpSchema)
  })

  const [errorMsg, seterrorMsg] = useState(null)
  const [successMsg, setsuccessMsg] = useState(null)
  const [isLoading, setisLoading] = useState(false)
  const nav = useNavigate()

  async function onSubmit (values){
    setsuccessMsg(null)
    seterrorMsg(null)

    try {
      setisLoading(true)
      const {data} = await axios.post("https://route-posts.routemisr.com/users/signup", values)
      setsuccessMsg(data.message)
      
      setTimeout(() => {
        setsuccessMsg(null)
      }, 999);

      setTimeout(() => {
        nav("/login")
      }, 1000);

    } catch (error) {
      console.log(error)
      seterrorMsg(error.response.data.message)
    } finally{
      setisLoading(false)
    }
  }

  // console.log(errors)

  return (
    <>
      <div className='container max-w-sm p-6 my-7 mx-auto rounded-xl bg-white dark:bg-gray-800 shadow-2xl'>
        <h1 className='font-bold text-2xl text-center mb-4'>Sign Up</h1>

        { errorMsg && <p className='bg-red-500 text-white text-center font-semibold p-3 my-0.5 rounded-sm text-lg'>{errorMsg}</p> }
        { successMsg && <p className='bg-green-500 text-white text-center font-semibold p-3 my-0.5 rounded-sm text-lg'>{successMsg}</p> }
        
        <form  onSubmit={ handleSubmit( onSubmit ) } action="">
          <div className='flex flex-col mb-3'>
            <label htmlFor="name">Full Name:</label>
            <input {...register("name")} className='border-2 rounded-sm p-0.5 border-gray-300 dark:border-gray-500 outline-none focus:border-blue-500' type="text" id='name' />

            {errors.name && <p className='bg-red-400 text-white p-1 my-0.5 rounded-sm text-sm'>{errors.name.message}</p>}
          </div>

          <div className='flex flex-col mb-3'>
            <label htmlFor="username">Username:</label>
            <input {...register("username")}  className='border-2 rounded-sm p-0.5 border-gray-300 dark:border-gray-500 outline-none focus:border-blue-500'  type="text" id='username'/>

            {errors.username && <p className='bg-red-400 text-white p-1 my-0.5 rounded-sm text-sm'>{errors.username.message}</p>}
          </div>

          <div className='flex flex-col mb-3'>
            <label htmlFor="email">email:</label>
            <input {...register("email")} className='border-2 rounded-sm p-0.5 border-gray-300 dark:border-gray-500 outline-none focus:border-blue-500' type="email" id='email' />

            {errors.email && <p className='bg-red-400 text-white p-1 my-0.5 rounded-sm text-sm'>{errors.email.message}</p>}
          </div>

          <div className='flex flex-col mb-3'>
            <label htmlFor="password">password:</label>
            <input {...register("password")} className='border-2 rounded-sm p-0.5 border-gray-300 dark:border-gray-500 outline-none focus:border-blue-500' type="password" id='password' />

            {errors.password && <p className='bg-red-400 text-white p-1 my-0.5 rounded-sm text-sm'>{errors.password.message}</p>}
          </div>

          <div className='flex flex-col mb-3'>
            <label htmlFor="rePassword">rePassword:</label>
            <input {...register("rePassword")} className='border-2 rounded-sm p-0.5 border-gray-300 dark:border-gray-500 outline-none focus:border-blue-500' type="password" id='rePassword' />

            {errors.rePassword && <p className='bg-red-400 text-white p-1 my-0.5 rounded-sm text-sm'>{errors.rePassword.message}</p>}
          </div>

          <div className='flex flex-col mb-3'>
            <label htmlFor="dateOfBirth">date of birth:</label>
            <input {...register("dateOfBirth")} className='border-2 rounded-sm p-0.5 border-gray-300 dark:border-gray-500 outline-none focus:border-blue-500' type="date" id='dateOfBirth' />

            {errors.dateOfBirth && <p className='bg-red-400 text-white p-1 my-0.5 rounded-sm text-sm'>{errors.dateOfBirth.message}</p>}
          </div>

          <div className='flex flex-col mb-3'>
            <span className='mb-1'>gender:</span>
            <div className='flex gap-4'>
              <label className='flex items-center gap-1'>
                <input {...register("gender")} type="radio" name="gender" value="male" />
                Male
              </label>
              <label className='flex items-center gap-1'>
                <input {...register("gender")} type="radio" name="gender" value="female" />
                Female
              </label>
            </div>

            {errors.gender && <p className='bg-red-400 text-white p-1 my-0.5 rounded-sm text-sm'>{errors.gender.message}</p>}
          </div>
          
          {isLoading ? <button disabled className='bg-blue-500/50 p-2 mt-3 rounded-sm hover:cursor-pointer hover:bg-blue-500/50 text-white text-xl w-full'>Loading...</button> : <button className='bg-blue-500 p-2 mt-3 rounded-sm hover:cursor-pointer hover:bg-blue-600 text-white text-xl w-full'>Sign Up</button>}
        </form>
      </div>
    </>
  )
}
