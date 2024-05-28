import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
export default function MyBlogs() {
    const [myblogs, setMyBlogs] = useState([]);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [comments, setComments] = useState([]);

    useEffect(() => {
        const fetchBlogs = async () => {
            const response = await axios.get("http://localhost:4444/api/posts/myposts", {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            });
            setMyBlogs(response.data);
        };
        fetchBlogs();
    }, []);

    const fetchComments = async (blogId) => {
        try {
            const response = await axios.get(`http://localhost:4444/api/post/${blogId}/comment`);
            setComments(response.data);
        } catch (err) {
            console.error(err);
        }
    };
    console.log(comments)

    const handleBlogClick = async (blog) => {
        setSelectedBlog(blog);
        fetchComments(blog._id);
    };

    return (
        <div>
            <h1>My Blogs</h1>
            {myblogs.length !== 0 ? (
                <ul>
                    {myblogs.map((blog) => (
                        <li key={blog._id}>
                            <Link  onClick={()=>handleBlogClick(blog)}>{blog.content}</Link>
                            {selectedBlog && selectedBlog._id === blog._id && (
                                <div>
                                    <h2>{selectedBlog.title}</h2>
                                    <p>{selectedBlog.content}</p>
                                    <h3>Comments</h3>
                                    <ul>
                                        {comments.length!=0 ?comments.map(comment => (
                                            <li key={comment._id}>{comment.content}-commented by-{comment?.author?.username}</li>
                                        )):(<p>No comments yet</p>)}
                                    </ul>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No blogs found. Create your blog.</p>
            )}
        </div>
    );
}
