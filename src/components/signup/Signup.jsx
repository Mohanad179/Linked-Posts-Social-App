/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { faUser, faAt, faEnvelope, faLock, faCalendarDays, faUserPlus } from '@fortawesome/free-solid-svg-icons'
 

const inputCls = 'w-full rounded-xl border border-gray-300 bg-gray-50 py-2.5 pl-10 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 aria-invalid:border-red-500 dark:border-gray-600 dark:bg-gray-900/60'
const iconCls = 'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 transition-colors peer-focus:text-blue-500'
const labelCls = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'
const errCls = 'mt-1.5 text-xs font-medium text-red-500 dark:text-red-400'
const eyeCls = 'absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'

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
  const [showPassword, setShowPassword] = useState(false)
  const [showRePassword, setShowRePassword] = useState(false)
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
      <div className='relative overflow-hidden px-4 py-10'>
    {/* ambient glow */}
    <div className='pointer-events-none absolute -top-24 left-1/4 size-72 rounded-full bg-blue-500/20 blur-3xl' />
    <div className='pointer-events-none absolute top-60 right-1/4 size-72 rounded-full bg-cyan-400/10 blur-3xl' />
 
    <div className='relative mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-2xl shadow-blue-500/10 backdrop-blur-xl dark:border-gray-700/60 dark:bg-gray-800/60'>
      <div className='absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-blue-500 to-transparent' />
 
      <div className='mb-7 text-center'>
        <div className='mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-linear-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30'>
          <FontAwesomeIcon icon={faUserPlus} />
        </div>
        <h1 className='bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-3xl font-bold text-transparent'>Create your account</h1>
        <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>Join LinkedPosts and start sharing</p>
      </div>
 
      {errorMsg && <p className='mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-sm font-medium text-red-600 dark:text-red-400'>{errorMsg}</p>}
      {successMsg && <p className='mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-center text-sm font-medium text-green-600 dark:text-green-400'>{successMsg}</p>}
 
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div>
            <label htmlFor='name' className={labelCls}>Full name</label>
            <div className='relative'>
              <input {...register('name')} id='name' type='text' autoComplete='name' placeholder='John Doe' aria-invalid={!!errors.name} className={`peer ${inputCls} pr-3`} />
              <FontAwesomeIcon icon={faUser} className={iconCls} />
            </div>
            {errors.name && <p className={errCls}>{errors.name.message}</p>}
          </div>
 
          <div>
            <label htmlFor='username' className={labelCls}>Username</label>
            <div className='relative'>
              <input {...register('username')} id='username' type='text' autoComplete='username' placeholder='johndoe' aria-invalid={!!errors.username} className={`peer ${inputCls} pr-3`} />
              <FontAwesomeIcon icon={faAt} className={iconCls} />
            </div>
            {errors.username && <p className={errCls}>{errors.username.message}</p>}
          </div>
        </div>
 
        <div>
          <label htmlFor='email' className={labelCls}>Email</label>
          <div className='relative'>
            <input {...register('email')} id='email' type='email' autoComplete='email' placeholder='you@example.com' aria-invalid={!!errors.email} className={`peer ${inputCls} pr-3`} />
            <FontAwesomeIcon icon={faEnvelope} className={iconCls} />
          </div>
          {errors.email && <p className={errCls}>{errors.email.message}</p>}
        </div>
 
        <div className='grid gap-4 sm:grid-cols-2'>
          <div>
            <label htmlFor='password' className={labelCls}>Password</label>
            <div className='relative'>
              <input {...register('password')} id='password' type={showPassword ? 'text' : 'password'} autoComplete='new-password' placeholder='••••••••' aria-invalid={!!errors.password} className={`peer ${inputCls} pr-10`} />
              <FontAwesomeIcon icon={faLock} className={iconCls} />
              <button type='button' onClick={() => setShowPassword(prev => !prev)} aria-label='Toggle password visibility' className={eyeCls}>
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            {errors.password && <p className={errCls}>{errors.password.message}</p>}
          </div>
 
          <div>
            <label htmlFor='rePassword' className={labelCls}>Confirm password</label>
            <div className='relative'>
              <input {...register('rePassword')} id='rePassword' type={showRePassword ? 'text' : 'password'} autoComplete='new-password' placeholder='••••••••' aria-invalid={!!errors.rePassword} className={`peer ${inputCls} pr-10`} />
              <FontAwesomeIcon icon={faLock} className={iconCls} />
              <button type='button' onClick={() => setShowRePassword(prev => !prev)} aria-label='Toggle password visibility' className={eyeCls}>
                <FontAwesomeIcon icon={showRePassword ? faEyeSlash : faEye} />
              </button>
            </div>
            {errors.rePassword && <p className={errCls}>{errors.rePassword.message}</p>}
          </div>
        </div>
 
        <div>
          <label htmlFor='dateOfBirth' className={labelCls}>Date of birth</label>
          <div className='relative'>
            <input {...register('dateOfBirth')} id='dateOfBirth' type='date' aria-invalid={!!errors.dateOfBirth} className={`peer ${inputCls} pr-3 dark:[color-scheme:dark]`} />
            <FontAwesomeIcon icon={faCalendarDays} className={iconCls} />
          </div>
          {errors.dateOfBirth && <p className={errCls}>{errors.dateOfBirth.message}</p>}
        </div>
 
        <div>
          <span className={labelCls}>Gender</span>
          <div className='grid grid-cols-2 gap-3'>
            {['male', 'female'].map(g => (
              <label key={g} className='cursor-pointer'>
                <input {...register('gender')} type='radio' value={g} className='peer sr-only' />
                <span className='flex items-center justify-center rounded-xl border border-gray-300 bg-gray-50 py-2.5 text-sm font-medium capitalize transition hover:border-blue-400 peer-checked:border-blue-500 peer-checked:bg-blue-500/10 peer-checked:text-blue-600 peer-focus-visible:ring-4 peer-focus-visible:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900/60 dark:peer-checked:text-blue-400'>{g}</span>
              </label>
            ))}
          </div>
          {errors.gender && <p className={errCls}>{errors.gender.message}</p>}
        </div>
 
        <button disabled={isLoading} className='mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-blue-500 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-blue-500/50 hover:brightness-110 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60'>
          {isLoading ? <><span className='size-4 animate-spin rounded-full border-2 border-white/40 border-t-white' />Creating account...</> : 'Sign Up'}
        </button>
      </form>
 
      <p className='mt-6 text-center text-sm text-gray-500 dark:text-gray-400'>
        Already have an account? <Link to='/login' className='font-semibold text-blue-600 hover:underline dark:text-blue-400'>Login</Link>
      </p>
    </div>
  </div>
    </>
  )
}
