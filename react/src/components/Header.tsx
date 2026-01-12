import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import { Box, Container } from "@mui/system";
import React from "react";
import AccountCircle from "@mui/icons-material/AccountCircle";

const Header: React.FC = () => {
    return (
        <AppBar position="static" sx={{flexGrow:1}}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{py: 2, flexGrow: 1, textAlign: 'left'}}>
                    Gossip With Go
                </Typography>

                <IconButton
                    
                    onClick={() => console.log("Account clicked")}
                >
                    <AccountCircle/>
                </IconButton>
            </Toolbar>
        </AppBar>
    )
}

export default Header