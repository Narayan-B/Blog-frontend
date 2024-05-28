import { useAuth } from "../context/AuthContext"
export default function Home(){
    const {user}=useAuth()
    return (
        <div>
            <h1>Home</h1>
            {user ?<p>Welcome {user.username}</p>:<p>Please login </p>}
        </div>
    )
}