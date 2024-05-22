import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import {IconButton, List, ListItem, ListItemButton, ListItemText} from "@mui/material";
import {NavLink, Outlet} from "react-router-dom";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import ChevronLeftIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import * as React from "react";
import ReaderLayout from "../layouts/reader-layout";
import section1 from "../lab-guide/section1.md";
import SectionLayout from "../layouts/section-layout";
import Section2 from "./section2";
import section2 from "../lab-guide/section2.md";
import Section3 from "./section3";
import section3 from "../lab-guide/section3.md";
import Section4 from "./section4";
import section4 from "../lab-guide/section4.md";
import Section5 from "./section5";
import section5 from "../lab-guide/section5.md";
import {CustomTabPanel} from "../layouts/navigation";
import Typography from "@mui/material/Typography";
import {styled} from "@mui/material/styles";

const drawerWidth = 240;

const navItems = [
    {path: '/', label: 'Section 1'},
    {path: '/section-2', label: 'Section 2'},
    {path: '/section-3', label: 'Section 3'},
    {path: '/section-4', label: 'Section 4'},
    {path: '/section-5', label: 'Section 5'},
]

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const DrawerHeader = styled('div')(({theme}) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
    fontSize: "1.25rem"
}));

export function Main() {

    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState(0);

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        setOpen(false)
    };

    return (
        <Box sx={{width: '100%', display: "flex"}} className={"App-header"}>
            <CssBaseline/>
            <AppBar position="fixed" color="info" enableColorOnDark sx={{zIndex: (theme) => theme.zIndex.drawer + 1}}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={toggleDrawer(!open)}
                        edge="start"
                        sx={{mr: 2, ...(open && {display: 'none'})}}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Hands-on with Event-Driven Architecture
                    </Typography>
                    <div>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Cisco Live 2024, Las Vegas
                        </Typography>
                    </div>
                </Toolbar>
            </AppBar>

            <Drawer open={open} onClose={toggleDrawer(false) }
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        [`& .MuiDrawer-paper`]: {width: drawerWidth, boxSizing: 'border-box'},
                        zIndex: (theme) => theme.zIndex.drawer + 2
                    }}>
                <DrawerHeader>
                    <IconButton onClick={toggleDrawer(false)}>
                        <ChevronLeftIcon />
                    </IconButton>
                </DrawerHeader>
                <Box sx={{overflow: 'auto', textAlign: "center", paddingTop: "1rem"}}>
                    <Typography variant={"h5"} sx={{fontWeight: "bold", color: "#163754"}}>Navigation</Typography>
                    <Tabs
                        orientation="vertical"
                        variant="scrollable"
                        value={value}
                        onChange={handleChange}
                        aria-label="Vertical tabs example"
                        sx={{ borderRight: 1, borderColor: 'divider', fontSize: "18pt" }}
                    >
                        <Tab label="Section 1" {...a11yProps(0)} />
                        <Tab label="Section 2" {...a11yProps(1)} />
                        <Tab label="Section 3" {...a11yProps(2)} />
                        <Tab label="Section 4" {...a11yProps(3)} />
                        <Tab label="Section 5" {...a11yProps(4)} />
                    </Tabs>                    {/*<List>*/}
                </Box>
            </Drawer>
            <Box component="main" sx={{flexGrow: 1, paddingTop: "3rem"}}>
                <CustomTabPanel value={value} index={0}>
                    <ReaderLayout mdPath={section1}></ReaderLayout>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                    <SectionLayout component={Section2({active: value === 1})} mdPath={section2}></SectionLayout>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={2}>
                    <SectionLayout component={Section3({active: value === 2})} mdPath={section3}></SectionLayout>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={3}>
                    <SectionLayout component={Section4({active: value === 3})} mdPath={section4}></SectionLayout>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={4}>
                    <SectionLayout component={Section5({active: value === 4})} mdPath={section5}></SectionLayout>
                </CustomTabPanel>
            </Box>
        </Box>
    );
}
