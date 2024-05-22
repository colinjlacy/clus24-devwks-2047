import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SectionLayout from "./section-layout";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import section1 from '../lab-guide/section1.md'
import Section2 from "../components/section2";
import section2 from '../lab-guide/section2.md'
import Section3 from "../components/section3";
import section3 from '../lab-guide/section3.md'
import Section4 from "../components/section4";
import section4 from '../lab-guide/section4.md'
import Section5 from "../components/section5";
import section5 from '../lab-guide/section5.md'
import ReaderLayout from "./reader-layout";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

export function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function BasicTabs() {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <CssBaseline />
            <AppBar position="fixed" color="info" enableColorOnDark sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <Tab label="Introduction" {...a11yProps(0)} />
                        <Tab label="First Events" {...a11yProps(1)} />
                        <Tab label="Consumer Groups" {...a11yProps(2)} />
                        <Tab label="The Saga Pattern" {...a11yProps(3)} />
                        <Tab label="Fan-In and the DLQ" {...a11yProps(4)} />
                    </Tabs>
                </Toolbar>
            </AppBar>

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
    );
}
