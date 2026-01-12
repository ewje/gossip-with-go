// src/components/Login.tsx
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

// We define an interface for props if we need to pass functions down later.
// For now, it's empty.
interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
    // 1. State to hold the username input
    // We explicitly tell TypeScript this state is a string
    const [username, setUsername] = useState<string>("");
    const navigate = useNavigate()

    // 2. Handler for typing in the textbox
    // TypeScript wants to know the event type for inputs: ChangeEvent<HTMLInputElement>
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    };

    // 3. Handler for the form submission (clicking the button or pressing Enter)
    // TypeScript wants the FormEvent type.
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Stop the page from reloading

        if (username.trim() === "") {
            alert("Please enter a username before logging in.");
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/login', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username }),
            });

            // 1. Parse the JSON (This matches your api.Response struct)
            const data = await response.json();

            if (response.ok) {
                // 2. Extract the data from the nested structure
                // Backend sent: { payload: { data: { token: 123 } }, messages: [...] }
                const token = data.payload.data.token;
                const successMessage = data.messages[0]; 

                console.log(successMessage); // "Login successful"
                
                // 3. Save the token
                // (Convert to string because LocalStorage only stores strings)
                localStorage.setItem('token', token.toString());

                // 4. Navigate
                navigate('/topics')
            } else {
                const errorMessage = "Login failed"
                console.error(data.messages[0] || errorMessage)
                alert(errorMessage)
            }

        } catch (error) {
            console.error("Network error:", error)
            alert("Could not connect to the server.")
        }
    };

    const handleRegisterClick = () => {
        navigate('/register')
    }

    return (
        // Container centers content and constrains max width
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                }}
            >
                {/* Paper gives it that "card" look with a slight shadow (elevation) */}
                <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

                    {/* A nice icon at the top */}
                    <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>

                    <Typography component="h1" variant="h5">
                        Login
                    </Typography>

                    {/* The Form structure */}
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                        <TextField
                        margin="normal"
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus // Automatically select this textbox on page load
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
                            Login
                        </Button>
                    </Box>

                    <Button
                        type="button"
                        fullWidth
                        variant="text"
                        sx={{py: 0 }}
                        onClick={handleRegisterClick}
                    >
                        Register New User
                    </Button>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;