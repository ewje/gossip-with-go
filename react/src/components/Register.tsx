import React, { useState } from 'react';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Avatar,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Register: React.FC = () => {
    const [username, setUsername] = useState<string>("");
    const navigate = useNavigate()

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Stop the page from reloading

        if (username.trim() === "") {
            alert("Please enter a username before registering.");
            return;
        }

        console.log("Attempting to register user:", username);
        
        try {
            const response = await fetch('http://localhost:8000/api/users', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username }),
            });        
            
            const data = await response.json();

            if (response.ok) {
                const token = data.payload.data.token;
                const successMessage = data.messages[0]; 

                console.log(successMessage); // "Login successful"
                
                localStorage.setItem('token', token.toString());

                navigate('/topics')
            } else {
                // If the backend sent an error message (like "User not found"), show it
                const errorMessage = "Registration failed";
                console.log(data.messages[0] || errorMessage)
                alert(errorMessage);
            }
        } catch (error) {
            console.error("Network error:", error)
            alert("Could not connect to the server.")
        }
        
        setUsername("");
    };

    const handleReturn = () => {
        navigate("/")
    }

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start'}}>
                        <Button 
                            variant="text"
                            startIcon={<ArrowBackIcon />}
                            onClick={handleReturn}
                        >
                            Login
                        </Button>
                    </Box>
                    
                    <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>

                    <Typography component="h1" variant="h5">
                        Register
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                        <TextField
                        margin="normal"
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus 
                        value={username}
                        onChange={handleInputChange}
                        />

                        <Button
                            type="submit" // This makes pressing "Enter" submit the form
                            fullWidth
                            variant="contained" // "contained" makes it a solid filled button
                            sx={{ mt: 3, mb: 2, py: 1.5 }} // Custom spacing (margin top/bottom, padding y)
                            disabled={username.trim().length === 0} // Disable button if empty
                        >
                            Register
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register;