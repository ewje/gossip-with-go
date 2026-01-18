import { AppBar, IconButton, Menu, MenuItem, Toolbar, Typography } from "@mui/material";
import React from "react";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
    const navigate = useNavigate()
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    };
    const handleClose = () => {
        setAnchorEl(null)
    }
    const handleLogout =() => {
        handleClose()
        localStorage.removeItem('token')
        navigate('/')
    }

    return (
        <AppBar position="static" sx={{flexGrow:1}}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{py: 2, flexGrow: 1, textAlign: 'left'}}>
                    Gossip With Go
                </Typography>

                <IconButton
                    onClick={handleClick}
                >
                    <AccountCircle/>
                </IconButton>

                <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    )
}

export default Header