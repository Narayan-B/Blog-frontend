import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Button, Stack, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function SingleBlog() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState([]);
    const [editCommentId, setEditCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState("");
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [commentToDeleteId, setCommentToDeleteId] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`http://localhost:4444/api/posts/${id}`);
                setPost(response.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchPost();
    }, [id]);

    const fetchComments = async () => {
        try {
            const response = await axios.get(`http://localhost:4444/api/post/${id}/comment`);
            setComments(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [id]);

    const handleCommentSubmit = async (event) => {
        event.preventDefault();
        if (!user) {
            toast.error("Please login to comment");
            navigate('/login');
            return;
        }
        try {
            await axios.post(
                `http://localhost:4444/api/post/${id}/comment`,
                { content: commentText },
                { headers: { Authorization: localStorage.getItem("token") } }
            );
            setCommentText("");
            fetchComments(); // Fetch comments again to include the new comment
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditCommentSubmit = async (commentId) => {
        try {
            const response = await axios.put(
                `http://localhost:4444/api/post/${id}/comment/${commentId}`,
                { content: editCommentText },
                { headers: { Authorization: localStorage.getItem("token") } }
            );
            const updatedComment = response.data;
            setComments(comments.map(comment => {
                if (comment._id === updatedComment._id) {
                    return {
                        ...updatedComment,
                        author: comment.author // Preserve author information
                    };
                }
                return comment;
            }));
            setEditCommentId(null);
            setEditCommentText("");
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteConfirmationOpen = (commentId) => {
        setCommentToDeleteId(commentId);
        setDeleteConfirmationOpen(true);
    };

    const handleDeleteConfirmationClose = () => {
        setDeleteConfirmationOpen(false);
        setCommentToDeleteId(null);
    };

    const handleDeleteComment = async () => {
        try {
            await axios.delete(`http://localhost:4444/api/post/${id}/comment/${commentToDeleteId}`, {
                headers: { Authorization: localStorage.getItem("token") }
            });
            setComments(comments.filter(comment => comment._id !== commentToDeleteId));
            handleDeleteConfirmationClose();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h1>Single Blog</h1>
            {post && (
                <>
                    <h2>{post.title}</h2>
                    <p>{post.content}</p>
                </>
            )}

            <h2>Comments</h2>
            <form onSubmit={handleCommentSubmit}>
                <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write your comment here"
                ></textarea>
                <Button variant="contained" color="primary" type='submit'>Comment</Button>
            </form>

            <ul>
                {comments.map((comment) => (
                    <li key={comment._id}>
                        <p>{comment.content} - commented By - {comment?.author?.username}</p>

                        {user && user._id === comment.author._id && (
                            <>
                                <Stack spacing={2} direction={'row'}>
                                    <Button
                                        variant="contained" color="primary" startIcon={<EditIcon />}
                                        onClick={() => { setEditCommentId(comment._id); setEditCommentText(comment.content); }}>
                                        Edit
                                    </Button>
                                    <Button
                                        variant='contained'
                                        color='error'
                                        startIcon={<DeleteIcon />}
                                        onClick={() => handleDeleteConfirmationOpen(comment._id)}>
                                        Delete
                                    </Button>
                                </Stack>
                            </>
                        )}
                        {editCommentId === comment._id && (
                            <form onSubmit={(e) => { e.preventDefault(); handleEditCommentSubmit(comment._id); }}>
                                <textarea
                                    value={editCommentText}
                                    onChange={(e) => setEditCommentText(e.target.value)}
                                    placeholder="Edit your comment"
                                ></textarea><br />
                                <Button variant="contained" color="primary" type='submit'>Submit</Button>
                            </form>
                        )}
                    </li>
                ))}
            </ul>

            <Dialog open={deleteConfirmationOpen} onClose={handleDeleteConfirmationClose}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this comment?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteConfirmationClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteComment} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
