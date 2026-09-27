
import { useContext, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { authContext } from './../authContext/AuthContext';

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
      <div className='container max-w-sm p-6 mt-7 mx-auto rounded-xl bg-white dark:bg-gray-800 shadow-2xl'>
        <h1 className='font-bold text-2xl text-center mb-4'>Login</h1>

        { errorMsg && <p className='bg-red-500 text-white text-center font-semibold p-3 my-0.5 rounded-sm text-lg'>{errorMsg}</p> }
        { successMsg && <p className='bg-green-500 text-white text-center font-semibold p-3 my-0.5 rounded-sm text-lg'>{successMsg}</p> }
        
        <form  onSubmit={ handleSubmit( onSubmit ) } action="">
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

          {isLoading ? <button disabled className='bg-blue-500/50 p-2 mt-3 rounded-sm hover:cursor-pointer hover:bg-blue-500/50 text-white text-xl w-full'>Loading...</button> : <button className='bg-blue-500 p-2 mt-3 rounded-sm hover:cursor-pointer hover:bg-blue-600 text-white text-xl w-full'>Login</button>}
        </form>
      </div>
    </>
  )
}
