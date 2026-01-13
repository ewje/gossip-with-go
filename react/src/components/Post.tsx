import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Header from "./Header"
import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, List, ListItem, ListItemText, TextField, Typography } from "@mui/material"
import React from "react"

interface Comment {
    id: number
    content: string
    user_id: number
    post_id: number
    created_at: number
}

const Post:React.FC = () => {
    const [comments, setComments] = useState<Comment[]>([])
    const [newCommentText, setNewCommentText] = useState("")
    const [open, setOpen] = useState(false)
    //const navigate = useNavigate()
    const { postId } = useParams()
    //const topicIdInt = parseInt(topicId || "0")

    useEffect(() => {
        fetchComments()
    }, [])

    const fetchComments = async () => {
        try {
            const reponse = await fetch(`http://localhost:8000/api/posts/${postId}/comments`) 
            const result = await reponse.json()
            setComments(result.payload?.data || result)
        } catch (error) {
            console.error("Error fetching posts:", error)
        }
    }

    const handleCreateComment = async () => {
        const token = localStorage.getItem('token');

        if (newCommentText.trim() === "") {
            alert("Comment's text cannot be blank");
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
                    content: newCommentText,
                    user_id: parseInt(token),
                    post_id: parseInt(postId)
                })
            })

            const data = await response.json()

            if (response.ok) {
                console.log(data.messages[0])
                setOpen(false)
                setNewCommentText("")
                fetchComments()
            } else {
                console.error(data.messages[0])
                alert("Failed to create new comment")
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div>
            <Header />
            <Container maxWidth={false} sx={{px: 15, mt: 5, flexGrow: 1}} disableGutters>
                <Box sx={{ mb: 1, display: 'flex'}}>
                    <Typography variant="h4" sx={{flexGrow: 1, textAlign: 'left'}} fontWeight={'Bold'}>
                        Posts
                    </Typography>

                    <Button variant="contained" onClick={()=> setOpen(true)}>
                        Comment
                    </Button>
                </Box>
                
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {comments.map((comment, index) => (
                        <React.Fragment key={comment.id}>
                            <ListItem sx={{px: 5}} alignItems="flex-start">
                                <ListItemText
                                    primary={comment.content}
                                    secondary={`By User #${comment.user_id}`}
                                />
                            </ListItem>
                            {index < comments.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                    ))}
                </List>
            </Container>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>
                    Create New Topic
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
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateComment} variant="contained">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default Post