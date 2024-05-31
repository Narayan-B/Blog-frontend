import axios from "axios"
import { useState,useEffect } from "react"
import { Link } from "react-router-dom"
export default function ListBlogs(){
    // const navigate=useNavigate()
    const [posts,setposts]=useState('')
    useEffect(()=>{
        const fetchPosts=async()=>{
            const response=await axios.get('http://localhost:4444/api/posts')
            setposts(response.data)
        }
        fetchPosts()

    },[])
    // const handleClick=(id)=>{
    //     navigate(`/api/posts/${id}`)
    // }
    return (
        <div>
            <h1>List Blogs</h1>
            <ul>
            {posts.length !== 0 ? posts.map((ele) => (
                    <Link to={`/single-blog/${ele._id}`} key={ele._id}>
                        <li>{ele.title}</li>
                    </Link>
                )) : (
                    <p>No blogs at this moment</p>
                )}
            </ul>
        </div>
    )
}