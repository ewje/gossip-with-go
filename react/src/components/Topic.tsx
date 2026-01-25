import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Header from "./Header";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Container } from "@mui/system";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, List, ListItem, ListItemButton, ListItemText, TextField, Typography } from "@mui/material";

interface Post {
    id: number
    title: string
    content: string
    user_id: number
    topic_id: number
    created_at: number
}

interface Topic {
    id: number
    name: string
    description: string
    user_id: number
}

interface User {
    id: number
    username: string
}

const Topic:React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([])
    const [newPostTitle, setNewPostTitle] = useState("")
    const [newPostContent, setNewPostContent] = useState("")
    const [topic, setTopic] = useState<Topic>({
        id: 0,
        name: "",
        description: "",
        user_id: 0
    })
    const [users, setUsers] = useState<User[]>([])
    const [open, setOpen] = useState(false)
    const [edit, setEdit] = useState(false)
    const [editPost, setEditPost] = useState<Post>({
            id: 0,
            title: "",
            content: "",
            user_id: 0,
            topic_id: 0,
            created_at: 0
        })
    const [postToDelete, setPostToDelete] = useState<number | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const navigate = useNavigate()
    const { topicId } = useParams()
    const currentUserId = parseInt(localStorage.getItem('token') || "0")

    useEffect(() => {
        fetchTopic()
        fetchPosts()
        fetchUsers()
    }, [])

    const fetchPosts = async () => {
        try {
            const reponse = await fetch(`http://localhost:8000/api/topics/${topicId}/posts`) 
            const result = await reponse.json()
            const sorted = result.payload?.data.sort((n1: Post, n2: Post) => {
                if (n1.created_at < n2.created_at) return 1

                if (n1.created_at > n2.created_at) return -1

                return 0
            })
            setPosts(sorted || result)
        } catch (error) {
            console.error("Error fetching posts:", error)
        }
    }

    const fetchTopic = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/topics/${topicId}`)
            const result = await response.json()
            
            setTopic(result.payload?.data || result)
        } catch (error) {
            console.error("Error fetching topic:", error)
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

    const handleCreatePost = async () => {
        const token = localStorage.getItem('token');

        if (newPostTitle.trim() === "" || newPostContent.trim() === "") {
            alert("Post's title and content cannot be blank")
            return
        }

        if(!token) {
            alert("You must be logged in to create a post!")
            return
        }

        if(!topicId) {
            alert("Missing Topic ID")
            return
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

    const handleEditPost = async () => {
        if (newPostTitle.trim() === "" || newPostContent.trim() === "") {
            alert("Post's title and content cannot be blank")
            return
        }

        try{
            const response = await fetch(`http://localhost:8000/api/posts/${editPost.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editPost.id,
                    title: newPostTitle,
                    content: newPostContent,
                    user_id: editPost.user_id,
                    topic_id: editPost.topic_id,
                    created_at: editPost.created_at
                })
            })

            const data = await response.json()

            if (response.ok) {
                console.log(data.messages[0])
                setOpen(false)
                setEdit(false)
                setNewPostContent("")
                setNewPostTitle("")
                fetchPosts()
            } else {
                console.error(data.messages[0])
                alert("Failed to edit post")
            }
        } catch (error) {
            console.error(error)
            alert("Could not connect to server!")
        }
    }

    const deleteDialog = (id: number) => {
        setPostToDelete(id)
        setDeleteDialogOpen(true)
    }

    const handleDeletePost = async () => {
        if (!postToDelete) {
            alert("Failed to delete post")
            return
        }

        try {
            const response = await fetch(`http://localhost:8000/api/posts/${postToDelete}`, {
                method: 'DELETE',
            })

            const data = await response.json()

            if (response.ok) {
                console.log(data.messages[0])
                fetchPosts()
                setDeleteDialogOpen(false)
                setPostToDelete(null)
            } else {
                console.error(data.messages[0])
                alert("Failed to delete post")
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
                <Box sx={{ mb: 1, display: 'flex'}}>
                    <Typography variant="h4" sx={{flexGrow: 1, textAlign: 'left'}} fontWeight={'Bold'}>
                        {topic.name}
                    </Typography>

                    <Button variant="contained" onClick={()=> setOpen(true)}>
                        New Post
                    </Button>
                </Box>
                <Typography sx={{textAlign: 'left', flexGrow: 1}}>
                    {topic.description}
                </Typography>
                
                {posts.length === 0 ? (
                    <Typography variant="body1" sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                        No posts found. Be the first to start a conversation!
                    </Typography>
                ) : (
                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        {posts.map((post, index) => (
                            <React.Fragment key={post.id}>
                                <ListItem
                                    disablePadding 
                                >
                                    <ListItemButton onClick={() => navigate(`/posts/${post.id}`)} sx={{width: '100%'}}>
                                        <ListItemText
                                            disableTypography
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                    <Typography variant="h6" sx={{ mr: 2, lineHeight: 1.2 }}>
                                                        {post.title}
                                                    </Typography>

                                                    <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ mr: 1, whiteSpace: 'nowrap' }}>
                                                            {new Date(post.created_at).toLocaleDateString()}
                                                        </Typography>

                                                        {post.user_id === currentUserId && (
                                                            <Box sx={{ display: 'flex' }}>
                                                                <IconButton 
                                                                    size="small"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                            setEdit(true)
                                                                            setOpen(true)
                                                                            setNewPostContent(post.content)
                                                                            setNewPostTitle(post.title)
                                                                            setEditPost(post)
                                                                        }}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                                <IconButton 
                                                                    size="small" 
                                                                    color="error"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        deleteDialog(post.id)
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
                                                <Box>
                                                    <Typography variant="caption">
                                                        Posted by {getUsername(post.user_id)} 
                                                    </Typography>
                                                    <Typography 
                                                        sx={{
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: "vertical",                                                   
                                                        }}
                                                    >
                                                        {post.content}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItemButton>
                                    
                                </ListItem>
                                {index < posts.length - 1 && <Divider  component="li" />}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Container>

            <Dialog open={open} onClose={() => {setOpen(false); setNewPostContent(""); setNewPostTitle("")}} slotProps={{paper:{sx:{minWidth: '500px'}}}}>
                <DialogTitle>
                    {edit ? "Edit post" : "Create new post"}
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
                        autoFocus
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
                    <Button onClick={() => {setOpen(false); setNewPostContent(""); setNewPostTitle("")}}>
                        Cancel
                    </Button>
                    <Button onClick={edit ? handleEditPost : handleCreatePost} variant="contained">
                        {edit ? "Edit" : "Create"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteDialogOpen} onClose={() => {setDeleteDialogOpen(false); setPostToDelete(null)}}>
                <DialogTitle>
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this post? This will delete all comments under this post too!
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {setDeleteDialogOpen(false); setPostToDelete(null)}}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeletePost} variant="contained" color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default Topic