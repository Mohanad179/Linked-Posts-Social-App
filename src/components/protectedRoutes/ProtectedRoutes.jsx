import { useContext } from 'react'
import { authContext } from './../authContext/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoutes({children}) {

const {token} = useContext(authContext)

    if(!token){
        return <Navigate to={"/login"}/>
    }

    return (
        children
    )
}
