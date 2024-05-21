import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import {
    AlertTitle, Badge,
    Button,
    List, ListItem, ListItemIcon, ListItemText,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import * as React from "react";
import {useEffect, useState} from "react";
import axios from "axios";
import {
    AUTHORIZER_URL, DLQ_URL,
    FIRST_CONSUMER_URL,
    NOTIFIER_URL,
    POLLING_INTERVAL,
    PRODUCER_URL,
    PROVISIONER_URL
} from "../config/constants";
import {ProducerService} from "../services/producer.srvc";
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import {AccessTime, CheckCircleOutline, TaskAlt} from "@mui/icons-material";
import {Alert, TabContext, TabList, TabPanel} from "@mui/lab";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";

const userEntries = Object.entries(ProducerService.fetchUsers())
const topicToPropertyMap: { [key: string]: string } = {
    "new-user": "provisioned",
    "authorize": "authorized",
    "notify": "notified",
    "notified": "complete"
}

export default function Section5(props: { active: boolean }) {
    const [isProducerActive, setProducerActive] = useState(true);
    const [isProvisionerActive, setProvisionerActive] = useState(true);
    const [isAuthorizerActive, setAuthorizerActive] = useState(true);
    const [isNotifierActive, setNotifierActive] = useState(true);
    const [isConsumerActive, setConsumerActive] = useState(true);
    const [errorList, setErrorList] = useState<string[]>([]);
    const [nextUserIndex, setNextUserIndex] = useState<number>(0);
    const [sagaTraces, setSagaTraces] = useState<{ [key: string]: any }[]>([])
    const [selectedTab, setSelectedTab] = React.useState('1');

    useEffect(() => {
        if (!props.active) return
        const producerInt = setInterval(() => {
            axios.get(`${PRODUCER_URL}/ping`).then(res => {
                if (res.status === 200) {
                    setProducerActive(true)
                    console.log("section 3 producer running")
                }
            }).catch(() => {
                setProducerActive(false)
                console.log("producer down")
            });
        }, POLLING_INTERVAL)
        const sagaInt = setInterval(async () => {
            if (!props.active) return
            const responses = await Promise.allSettled([
                axios.get(`${PROVISIONER_URL}`), axios.get(`${AUTHORIZER_URL}`), axios.get(`${NOTIFIER_URL}`)
            ]);
            let traces = [...sagaTraces]
            for (let i = 0; i < responses.length; i++) {
                if (responses[i].status === "rejected") {
                    switch (i) {
                        case 0:
                            setProvisionerActive(false);
                            break
                        case 1:
                            setAuthorizerActive(false);
                            break
                        case 2:
                            setNotifierActive(false)
                            break
                    }
                    return
                }
                if (i === 0) {
                    //@ts-ignore
                    const val = responses[i].value
                    Object.keys(val.data).forEach((key: string) => {
                        const prop: string = topicToPropertyMap[key]
                        val.data[key].forEach((user: { [key: string]: any }) => {
                            traces = traces.map(trace => trace.id === user.id ? Object.assign({}, {[prop]: true}, trace) : trace)
                        })
                    })
                }
            }
            setSagaTraces(traces)
        }, POLLING_INTERVAL)
        const consumerInt = setInterval(() => {
            if (!props.active) return
            axios.get(`${DLQ_URL}/ping`).then(async res => {
                if (res.status === 200) {
                    setConsumerActive(true)
                    const cRes = await axios.get(`${DLQ_URL}`)
                    if (cRes.status === 200) {
                        const items: string[] = []
                        cRes.data.forEach((item: { [key: string]: string }) => {
                            let str = `Service: ${item.service} | Error: ${item.error}`
                            items.unshift(str)
                        })
                        setErrorList((prev: any[]): any[] => [...items, ...prev])
                    }
                }
            }).catch(() => {
                setConsumerActive(false)
                console.log("consumer down")
            });
        }, POLLING_INTERVAL)
        return function () {
            clearInterval(producerInt);
            clearInterval(sagaInt);
            clearInterval(consumerInt)
        }
    }, [props.active, sagaTraces]);

    async function sendEvent() {
        await ProducerService.postEvent({
            topic: "new-user",
            errors: true,
            id: nextUserIndex,
            ...userEntries[nextUserIndex][1]
        })
        setSagaTraces([userEntries[nextUserIndex][1], ...sagaTraces])
        setNextUserIndex(nextUserIndex + 1)
    }

    function clearTraces() {
        setSagaTraces([])
        setNextUserIndex(0)
    }

    function clearErrors() {
        setErrorList([])
    }

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setSelectedTab(newValue);
    };

    return (
        <>
            {(!isProvisionerActive || !isAuthorizerActive || !isNotifierActive) &&
                <Alert variant="filled" severity="warning" style={{marginBottom: "2rem"}}>
                    <AlertTitle>Warning</AlertTitle>
                    Check the Provisioner, Authorizer, and Notifier docker containers; one or more of them is not
                    active.
                </Alert>
            }

            <Paper elevation={3} variant={"outlined"} square={false} style={{padding: "1rem"}}>
                <Typography variant="h4" gutterBottom>
                    Producer: {!isProducerActive && "Offline"}
                </Typography>
                <Typography paragraph>
                    Click the button below to send a POST request that will be converted to an Event by the Producer.
                </Typography>

                <Button variant={"contained"} color={"secondary"}
                        disabled={!isProducerActive || nextUserIndex >= userEntries.length}
                        onClick={sendEvent}>
                    Onboard New User
                </Button>
                {
                    nextUserIndex >= userEntries.length && <Alert severity="warning" style={{marginTop: "1rem"}}>
                        No more new users to onboard.
                    </Alert>
                }
            </Paper>

            <Paper elevation={3} variant={"outlined"} square={false} style={{padding: "1rem", marginTop: "2rem"}}
                   className={"consumer"}>

                <TabContext value={selectedTab}>
                    <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                        <TabList onChange={handleTabChange} aria-label="lab API tabs example">
                            <Tab label="Users" value="1"/>
                            <Tab label="Errors" value="2"/>
                        </TabList>
                    </Box>
                    <TabPanel value="1" style={{padding: "0"}}>
                        <List>
                            {
                                sagaTraces.length !== 0 && sagaTraces.map((trace: {[key: string]: any}, ind: number) => (
                                    <ListItem key={ind} className={trace.complete ? "dlq-complete" : ""}>
                                        <ListItemIcon>
                                            {trace.complete ? <TaskAlt color={"success"}/> : <AccessTime color={"disabled"}/>}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={trace.name}
                                        />
                                    </ListItem>
                                ))
                            }
                            {
                                sagaTraces.length === 0 && <ListItem>
                                    <ListItemText
                                        primary="No users onboarded yet"
                                    />
                                </ListItem>
                            }
                        </List>
                        <Button variant={"outlined"} color={"info"} startIcon={<DeleteIcon/>}
                                disabled={Object.keys(sagaTraces).length === 0} onClick={clearTraces}
                                sx={{marginTop: "1rem"}}>
                            Clear Users
                        </Button>

                    </TabPanel>
                    <TabPanel value="2" style={{padding: "0"}}>
                        <List>
                            {
                                errorList.length !== 0 && errorList.map((err: string, ind: number) => (
                                    <ListItem key={ind} className={"dlq-error"}>
                                        <ListItemText
                                            primary={err}
                                        />
                                    </ListItem>
                                ))
                            }
                            {
                                errorList.length === 0 && <ListItem>
                                    <ListItemText
                                        primary="No errors yet"
                                    />
                                </ListItem>
                            }
                        </List>

                        <Button variant={"outlined"} color={"info"} startIcon={<DeleteIcon/>}
                                disabled={errorList.length === 0} onClick={clearErrors}
                                sx={{marginTop: "1rem"}}>
                            Clear Errors
                        </Button>

                    </TabPanel>
                </TabContext>
            </Paper>

        </>
    )
}