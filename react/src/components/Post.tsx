import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Header from "./Header"
import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, List, ListItem, ListItemText, TextField, Typography } from "@mui/material"
import React from "react"

interface Comment {
    id: number
    content: string
    user_id: number
    post_id: number
    created_at: number
}

interface Post {
    id: number
    title: string
    content: string
    user_id: number
    topic_id: number
    created_at: number
}

interface User {
    id: number
    username: string
}

const Post:React.FC = () => {
    const [comments, setComments] = useState<Comment[]>([])
    const [newCommentContent, setNewCommentContent] = useState("")
    const [post, setPost] = useState<Post>({
        id: 0,
        title: "",
        content: "",
        user_id: 0,
        topic_id: 0,
        created_at: 0,
    })
    const [users, setUsers] = useState<User[]>([])
    const [open, setOpen] = useState(false)
    const [edit, setEdit] = useState(false)
    const [editComment, setEditComment] = useState<Comment>({
            id: 0,
            content: "",
            user_id: 0,
            post_id: 0,
            created_at: 0
        })
    const [commentToDelete, setCommentToDelete] = useState<number | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    //const navigate = useNavigate()
    const { postId } = useParams()
    const currentUserId = parseInt(localStorage.getItem('token') || "0")

    useEffect(() => {
        fetchUsers()
        fetchComments()
        fetchPost()
    }, [])

    const fetchComments = async () => {
        try {
            const reponse = await fetch(`http://localhost:8000/api/posts/${postId}/comments`) 
            const result = await reponse.json()
            const sorted = result.payload?.data.sort((n1: Comment, n2: Comment) => {
                if (n1.created_at < n2.created_at) return 1

                if (n1.created_at > n2.created_at) return -1

                return 0
            })
            setComments(sorted || result)
        } catch (error) {
            console.error("Error fetching posts:", error)
        }
    }

    const fetchPost = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/posts/${postId}`)
            const result = await response.json()
            setPost(result.payload?.data || result)
        } catch (error) {
            console.error("Error fetching post:", error)
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/users`)
            const result = await response.json()
            setUsers(result.payload?.data || result)
        } catch (error) {
            console.error("Error fetching users:", error)
        }
    }

    const getUsername = (userId: number) => {
        const user = users.find((u) => u.id === userId)
        return user ? user.username : `User #${userId}`
    }

    const handleCreateComment = async () => {
        const token = localStorage.getItem('token');

        if (newCommentContent.trim() === "") {
            alert("Comment's content cannot be blank");
            return;
        }

        if(!token) {
            alert("You must be logged in to create a comment!");
            return;
        }

        if(!postId) {
            alert("Missing Comment ID");
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newCommentContent,
                    user_id: parseInt(token),
                    post_id: parseInt(postId)
                })
            })

            const data = await response.json()

            if (response.ok) {
                console.log(data.messages[0])
                setOpen(false)
                setNewCommentContent("")
                fetchComments()
            } else {
                console.error(data.messages[0])
                alert("Failed to create new comment")
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleEditComment = async () => {
        if (newCommentContent.trim() === "") {
            alert("Comment's content cannot be blank")
            return
        }

        try{
            const response = await fetch(`http://localhost:8000/api/comments/${editComment.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editComment.id,
                    content: newCommentContent,
                    user_id: editComment.user_id,
                    topic_id: editComment.post_id,
                    created_at: editComment.created_at
                })
            })

            const data = await response.json()

            if (response.ok) {
                console.log(data.messages[0])
                setOpen(false)
                setEdit(false)
                setNewCommentContent("")
                fetchComments()
            } else {
                console.error(data.messages[0])
                alert("Failed to edit comment")
            }
        } catch (error) {
            console.error(error)
            alert("Could not connect to server!")
        }
    }

    const deleteDialog = (id: number) => {
        setCommentToDelete(id)
        setDeleteDialogOpen(true)
    }

    const handleDeleteComment = async () => {
        if (!commentToDelete) {
            alert("Failed to delete comment")
            return
        }

        try {
            const response = await fetch(`http://localhost:8000/api/comments/${commentToDelete}`, {
                method: 'DELETE',
            })

            const data = await response.json()

            if (response.ok) {
                console.log(data.messages[0])
                fetchComments()
                setDeleteDialogOpen(false)
                setCommentToDelete(null)
            } else {
                console.error(data.messages[0])
                alert("Failed to delete comment")
            }
        } catch (error) {
            console.error(error)
            alert("Could not connect to server!")
        }
    }

    return (
        <div>
            <Header />
            <Container maxWidth={false} sx={{px: 15, mt: 5, flexGrow: 1}} disableGutters>
                <Box sx={{mb: 2}}>
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between'}}>
                        <Typography variant="caption">
                            {getUsername(post.user_id)}
                        </Typography>
                        <Typography variant="caption">
                            {new Date(post.created_at).toLocaleString()}
                        </Typography>
                    </Box>
                    <Typography variant="h4" sx={{mb: 2, flexGrow: 1, textAlign: 'left'}} fontWeight={'Bold'}>
                        {post.title}
                    </Typography>
                    <Typography variant="body1" sx={{textAlign: 'left'}}>
                        {post.content}
                    </Typography>
                </Box>
                <Box sx={{mb: 1, display: 'flex', justifyContent: 'space-between'}}>
                    <Typography variant="h6" fontWeight={'bold'}>
                        Comments
                    </Typography>
                    <Button variant="contained" onClick={()=> setOpen(true)} sx={{alignContent: 'end'}}>
                        Comment
                    </Button>
                </Box>
                
                {comments.length === 0 ? (
                    <Typography variant="body1" sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                        No comments found. Be the first to start a conversation!
                    </Typography>
                ) : (
                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        {comments.map((comment, index) => (
                            <React.Fragment key={comment.id}>
                                <ListItem alignItems="flex-start">
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                <Typography variant="h6" sx={{ mr: 2, lineHeight: 1.2 }}>
                                                    {getUsername(comment.user_id)}
                                                </Typography>

                                                <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1, whiteSpace: 'nowrap' }}>
                                                        {new Date(comment.created_at).toLocaleDateString()}
                                                    </Typography>

                                                    {comment.user_id === currentUserId && (
                                                        <Box sx={{ display: 'flex' }}>
                                                            <IconButton 
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                        setEdit(true)
                                                                        setOpen(true)
                                                                        setNewCommentContent(comment.content)
                                                                        setEditComment(comment)
                                                                    }}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton 
                                                                size="small" 
                                                                color="error"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    deleteDialog(comment.id)
                                                                }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        }
                                        secondary={
                                            <Typography variant="body1">
                                                {comment.content}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                                {index < comments.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Container>

            <Dialog open={open} onClose={() => {setOpen(false); setNewCommentContent("")}} slotProps={{paper:{sx:{minWidth: '500px'}}}}>
                <DialogTitle>
                    {edit ? "Edit comment" : "Create New Comment"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Comment Text"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={newCommentContent}
                        onChange={(e) => setNewCommentContent(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={edit ? handleEditComment : handleCreateComment} variant="contained">
                        {edit ? "Edit" : "Comment"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteDialogOpen} onClose={() => {setDeleteDialogOpen(false); setCommentToDelete(null)}}>
                <DialogTitle>
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this comment?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {setDeleteDialogOpen(false); setCommentToDelete(null)}}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteComment} variant="contained" color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default Post