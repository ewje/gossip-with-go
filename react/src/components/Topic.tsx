import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Header from "./Header";
import { Box, Container } from "@mui/system";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, List, ListItem, ListItemText, TextField, Typography } from "@mui/material";

interface Post {
    id: number
    title: string
    content: string
    user_id: number
    topic_id: number
    created_at: number
}

const Topic:React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([])
    const [newPostTitle, setNewPostTitle] = useState("")
    const [newPostContent, setNewPostContent] = useState("")
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    const { topicId } = useParams()
    //const topicIdInt = parseInt(topicId || "0")

    useEffect(() => {
        fetchPosts()
        console.log()
    }, [])

    const fetchPosts = async () => {
        try {
            const reponse = await fetch(`http://localhost:8000/api/topics/${topicId}/posts`) 
            const result = await reponse.json()
            setPosts(result.payload?.data || result)
        } catch (error) {
            console.error("Error fetching posts:", error)
        }
    }

    const handleCreatePost = async () => {
        const token = localStorage.getItem('token');

        if (newPostTitle.trim() === "" || newPostContent.trim() === "") {
            alert("Post's title and content cannot be blank");
            return;
        }

        if(!token) {
            alert("You must be logged in to create a post!");
            return;
        }

        if(!topicId) {
            alert("Missing Topic ID");
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newPostTitle,
                    content: newPostContent,
                    user_id: parseInt(token),
                    topic_id: parseInt(topicId)
                })
            })

            const data = await response.json()

            if (response.ok) {
                console.log(data.messages[0])
                setOpen(false)
                setNewPostContent("")
                setNewPostTitle("")
                fetchPosts()
            } else {
                console.error(data.messages[0])
                alert("Failed to create new post")
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
                        New Post
                    </Button>
                </Box>
                
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {posts.map((post, index) => (
                        <React.Fragment key={post.id}>
                            <ListItem sx={{px: 5}} alignItems="flex-start" onClick={() => navigate(`/posts/${post.id}`)}>
                                <ListItemText
                                    primary={post.title}
                                    secondary={`By User #${post.user_id}`}
                                />
                            </ListItem>
                            {index < posts.length - 1 && <Divider variant="inset" component="li" />}
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
                        label="Post Title"
                        fullWidth
                        variant="outlined"
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                    />
                    
                    <TextField
                        margin="dense"
                        label="Content"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreatePost} variant="contained">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default Topic