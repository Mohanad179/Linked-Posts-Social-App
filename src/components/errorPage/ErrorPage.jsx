import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

export default function ErrorPage() {

    const error = useRouteError()

    if(isRouteErrorResponse(error)){
        return <h1>{error.status} - {error.statusText}</h1>
    }

    return (
        <div>Something Went Wrong</div>
    )
}
