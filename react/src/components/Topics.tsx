import React, { useEffect, useState } from "react";
import Header from "./Header";
import { Box, Container, justifyContent } from "@mui/system";
import { Button, CssBaseline, Dialog, DialogActions, DialogContent, DialogTitle, Divider, List, ListItem, ListItemText, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router";

interface Topic {
    id: number;
    name: string;
    description: string;
    user_id: number;
}

const Topics:React.FC = () => {
    const [topics, setTopics] = useState<Topic[]>([])
    const [newTopicName, setNewTopicName] = useState("")
    const [newTopicDescription, setNewTopicDescription] = useState("")
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        fetchTopics()
    }, [])

    const fetchTopics = async () => {
        try {
            const reponse = await fetch('http://localhost:8000/api/topics') 
            const result = await reponse.json()
            setTopics(result.payload?.data || result)
        } catch (error) {
            console.error("Error fetching topics:", error)
        }
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
                
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {topics.map((topic, index) => (
                        <React.Fragment key={topic.id}>
                            <ListItem sx={{px: 5}} alignItems="flex-start" onClick={() => navigate(`/topics/${topic.id}`)}>
                                <ListItemText
                                    primary={topic.name}
                                    secondary={`By User #${topic.user_id}`}
                                />
                            </ListItem>
                            {index < topics.length - 1 && <Divider variant="inset" component="li" />}
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
                        label="Topic Name"
                        fullWidth
                        variant="outlined"
                        value={newTopicName}
                        onChange={(e) => setNewTopicName(e.target.value)}
                    />
                    
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={newTopicDescription}
                        onChange={(e) => setNewTopicDescription(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateTopic} variant="contained">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default Topics