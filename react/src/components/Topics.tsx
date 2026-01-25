import React, { useEffect, useState } from "react";
import Header from "./Header";
import { Box, Container } from "@mui/system";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, List, ListItem, ListItemButton, ListItemText, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router";

interface Topic {
    id: number;
    name: string;
    description: string;
    user_id: number;
}

interface User {
    id: number
    username: string
}

const Topics:React.FC = () => {
    const [topics, setTopics] = useState<Topic[]>([])
    const [newTopicName, setNewTopicName] = useState("")
    const [newTopicDescription, setNewTopicDescription] = useState("")
    const [users, setUsers] = useState<User[]>([])
    const [open, setOpen] = useState(false)
    const [edit, setEdit] = useState(false)
    const [editTopic, setEditTopic] = useState<Topic>({
            id: 0,
            name: "",
            description: "",
            user_id: 0
        })
    const [topicToDelete, setTopicToDelete] = useState<number | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const navigate = useNavigate()
    const currentUserId = parseInt(localStorage.getItem('token') || "0")

    useEffect(() => {
        fetchUsers()
        fetchTopics()
    }, [])

    const fetchTopics = async () => {
        try {
            const reponse = await fetch('http://localhost:8000/api/topics') 
            const result = await reponse.json()
            setTopics(result.payload?.data || result)
            console.log(`fetched! ${result.payload.data}`)
        } catch (error) {
            console.error("Error fetching topics:", error)
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

    const handleCreateTopic = async () => {
        const token = localStorage.getItem('token');

        if (newTopicName.trim() === "") {
            alert("Please enter a name for the topic!");
            return;
        }

        if(!token) {
            alert("You must be logged in to create a topic!");
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/topics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newTopicName,
                    description: newTopicDescription,
                    user_id: parseInt(token)
                })
            })

            const data = await response.json()

            if (response.ok) {
                console.log(data.messages[0])
                setOpen(false)
                setNewTopicName("")
                setNewTopicDescription("")
                fetchTopics()
            } else {
                console.error(data.messages[0])
                alert("Failed to create new topic")
            }
        } catch (error) {
            console.error(error)
            alert("Could not connect to server!")
        }
    }

    const handleEditTopic = async () => {
        if (newTopicName.trim() === "") {
            alert("Please enter a name for the topic!");
            return;
        }

        try{
            const response = await fetch(`http://localhost:8000/api/topics/${editTopic.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editTopic.id,
                    name: newTopicName,
                    description: newTopicDescription,
                    user_id: editTopic.user_id
                })
            })

            const data = await response.json()

            if (response.ok) {
                console.log(data.messages[0])
                setOpen(false)
                setEdit(false)
                setNewTopicName("")
                setNewTopicDescription("")
                fetchTopics()
            } else {
                console.error(data.messages[0])
                alert("Failed to edit topic")
            }
        } catch (error) {
            console.error(error)
            alert("Could not connect to server!")
        }
    }

    const deleteDialog = (id: number) => {
        setTopicToDelete(id)
        setDeleteDialogOpen(true)
    }

    const handleDeleteTopic = async () => {
        if (!topicToDelete) {
            alert("Failed to delete topic")
            return
        }

        try {
            const response = await fetch(`http://localhost:8000/api/topics/${topicToDelete}`, {
                method: 'DELETE',
            })

            const data = await response.json()

            if (response.ok) {
                console.log(data.messages[0])
                fetchTopics()
                setDeleteDialogOpen(false)
                setTopicToDelete(null)
            } else {
                console.error(data.messages[0])
                alert("Failed to delete topic")
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
                        Topics
                    </Typography>

                    <Button variant="contained" onClick={()=> setOpen(true)}>
                        New Topic
                    </Button>
                </Box>
                {topics.length === 0 ? (
                    <Typography variant="body1" sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                        No topics found. Be the first to start a conversation!
                    </Typography>
                ) : (
                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        {topics.map((topic, index) => (
                            <React.Fragment key={topic.id}>
                                <ListItem 
                                    disablePadding
                                >
                                    <ListItemButton onClick={() => navigate(`/topics/${topic.id}`)}>
                                        <ListItemText 
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                    <Typography variant="h6" sx={{ mr: 2, lineHeight: 1.2 }}>
                                                        {topic.name}
                                                    </Typography>

                                                    <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                                        {topic.user_id === currentUserId && (
                                                            <Box sx={{ display: 'flex' }}>
                                                                <IconButton 
                                                                    size="small"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        setEdit(true)
                                                                        setOpen(true)
                                                                        setNewTopicDescription(topic.description)
                                                                        setNewTopicName(topic.name)
                                                                        setEditTopic(topic)
                                                                    }}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                                <IconButton 
                                                                    size="small" 
                                                                    color="error"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        deleteDialog(topic.id)
                                                                    }}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>
                                            }
                                            secondary={`By ${getUsername(topic.user_id)}`}
                                        />
                                    </ListItemButton>
                                    
                                </ListItem>
                                {index < topics.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Container>

            <Dialog open={open} onClose={() => {setOpen(false); setNewTopicDescription(""); setNewTopicName("")}} slotProps={{paper:{sx:{minWidth: '500px'}}}}>
                <DialogTitle>
                    {edit ? "Edit Topic" : "Create New Topic"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        
                        margin="dense"
                        label="Topic Name"
                        fullWidth
                        variant="outlined"
                        value={newTopicName}
                        onChange={(e) => setNewTopicName(e.target.value)}
                    />
                    
                    <TextField
                        //margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={newTopicDescription}
                        onChange={(e) => setNewTopicDescription(e.target.value)}
                        sx={{ mt: 1, mb: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {setOpen(false); setNewTopicDescription(""); setNewTopicName("")}}>
                        Cancel
                    </Button>
                    <Button onClick={edit ? handleEditTopic : handleCreateTopic} variant="contained">
                        {edit ? "Edit" : "Create"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteDialogOpen} onClose={() => {setDeleteDialogOpen(false); setTopicToDelete(null)}}>
                <DialogTitle>
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this topic? This will delete all posts and comments under this topic too!
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {setDeleteDialogOpen(false); setTopicToDelete(null)}}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteTopic} variant="contained" color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default Topics