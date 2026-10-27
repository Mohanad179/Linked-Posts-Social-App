
import { useContext, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { authContext } from './../authContext/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom'
import { faEnvelope, faLock, faRightToBracket } from '@fortawesome/free-solid-svg-icons'
 

const inputCls = 'w-full rounded-xl border border-gray-300 bg-gray-50 py-2.5 pl-10 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 aria-invalid:border-red-500 dark:border-gray-600 dark:bg-gray-900/60'
const iconCls = 'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 transition-colors peer-focus:text-blue-500'
const labelCls = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'
const errCls = 'mt-1.5 text-xs font-medium text-red-500 dark:text-red-400'

// zod schema for validation
const loginSchema = z.object({
  email: z.email("Invalid Email"),

  password: z.string("Invalid Password")
})


export default function Login() {
  const {handleSubmit, register, formState: {errors}} = useForm({
    defaultValues:{
      email: "",
      password: "",
    },

    resolver : zodResolver(loginSchema)
  })

  const { setToken } = useContext(authContext)  

  const [errorMsg, seterrorMsg] = useState(null)
  const [successMsg, setsuccessMsg] = useState(null)
  const [isLoading, setisLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const nav = useNavigate()

  async function onSubmit (values){
    setsuccessMsg(null)
    seterrorMsg(null)

    try {
      setisLoading(true)

      const {data} = await axios.post("https://route-posts.routemisr.com/users/signin", values)

      setsuccessMsg(data.message)
      
      setToken(data.data.token)
      localStorage.setItem("token", data.data.token)
      
      setTimeout(() => {
        setsuccessMsg(null)
      }, 999);

      setTimeout(() => {
        nav("/") // after the login is the sucessfull , will redirect to the home page
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
    <div className='pointer-events-none absolute top-40 right-1/4 size-72 rounded-full bg-cyan-400/10 blur-3xl' />
 
    <div className='relative mx-auto max-w-md rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-2xl shadow-blue-500/10 backdrop-blur-xl dark:border-gray-700/60 dark:bg-gray-800/60'>
      <div className='absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-blue-500 to-transparent' />
 
      <div className='mb-7 text-center'>
        <div className='mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-linear-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30'>
          <FontAwesomeIcon icon={faRightToBracket} />
        </div>
        <h1 className='bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-3xl font-bold text-transparent'>Welcome back</h1>
        <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>Log in to continue to LinkedPosts</p>
      </div>
 
      {errorMsg && <p className='mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-sm font-medium text-red-600 dark:text-red-400'>{errorMsg}</p>}
      {successMsg && <p className='mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-center text-sm font-medium text-green-600 dark:text-green-400'>{successMsg}</p>}
 
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <div>
          <label htmlFor='email' className={labelCls}>Email</label>
          <div className='relative'>
            <input {...register('email')} id='email' type='email' autoComplete='email' placeholder='you@example.com' aria-invalid={!!errors.email} className={`peer ${inputCls} pr-3`} />
            <FontAwesomeIcon icon={faEnvelope} className={iconCls} />
          </div>
          {errors.email && <p className={errCls}>{errors.email.message}</p>}
        </div>
 
        <div>
          <label htmlFor='password' className={labelCls}>Password</label>
          <div className='relative'>
            <input {...register('password')} id='password' type={showPassword ? 'text' : 'password'} autoComplete='current-password' placeholder='••••••••' aria-invalid={!!errors.password} className={`peer ${inputCls} pr-10`} />
            <FontAwesomeIcon icon={faLock} className={iconCls} />
            <button type='button' onClick={() => setShowPassword(prev => !prev)} aria-label='Toggle password visibility' className='absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'>
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
          {errors.password && <p className={errCls}>{errors.password.message}</p>}
        </div>
 
        <button disabled={isLoading} className='mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-blue-500 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-blue-500/50 hover:brightness-110 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60'>
          {isLoading ? <><span className='size-4 animate-spin rounded-full border-2 border-white/40 border-t-white' />Logging in...</> : 'Login'}
        </button>
      </form>
 
      <p className='mt-6 text-center text-sm text-gray-500 dark:text-gray-400'>
        Don't have an account? <Link to='/signup' className='font-semibold text-blue-600 hover:underline dark:text-blue-400'>Sign up</Link>
      </p>
    </div>
  </div>
    </>
  )
}
