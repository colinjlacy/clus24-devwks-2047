import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import {
    AlertTitle,
    Button,
    FormControlLabel,
    FormGroup,
    Grid,
    Switch,
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
import {AUTHORIZER_URL, NOTIFIER_URL, POLLING_INTERVAL, PRODUCER_URL, PROVISIONER_URL} from "../config/constants";
import {ProducerService} from "../services/producer.srvc";
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import {CheckCircleOutline} from "@mui/icons-material";
import {Alert} from "@mui/lab";

const userEntries = Object.entries(ProducerService.fetchUsers())
const topicToPropertyMap: { [key: string]: string } = {
    "new-user": "provisioned",
    "authorize": "authorized",
    "notify": "notified",
    "notified": "complete"
}

export default function Section4(props: { active: boolean }) {
    const [isProducerActive, setProducerActive] = useState(true);
    const [isDebugMode, setDebugMode] = useState(true);
    const [isProvisionerActive, setProvisionerActive] = useState(true);
    const [isAuthorizerActive, setAuthorizerActive] = useState(true);
    const [isNotifierActive, setNotifierActive] = useState(true);
    const [nextUserIndex, setNextUserIndex] = useState<number>(0);
    const [sagaTraces, setSagaTraces] = useState<{ [key: string]: any }[]>([])

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
                //@ts-ignore
                const val = responses[i].value
                Object.keys(val.data).forEach((key: string) => {
                    const prop: string = topicToPropertyMap[key]
                    val.data[key].forEach((user: { [key: string]: any }) => {
                        traces = traces.map(trace => trace.id === user.id ? Object.assign({}, {[prop]: true}, trace) : trace)
                    })
                })
            }
            setSagaTraces(traces)
        }, POLLING_INTERVAL)
        return function () {
            clearInterval(producerInt);
            clearInterval(sagaInt);
        }
    }, [props.active, sagaTraces]);

    async function sendEvent() {
        await ProducerService.postEvent({
            topic: "new-user",
            id: nextUserIndex,
            ...userEntries[nextUserIndex][1]
        })
        setSagaTraces([userEntries[nextUserIndex][1], ...sagaTraces])
        setNextUserIndex(nextUserIndex + 1)
    }

    async function clearTraces() {
        setSagaTraces([])
        setNextUserIndex(0)
    }

    const toggleTraceMode = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDebugMode(event.target.checked);
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

                <Grid
                    container
                    direction="row"
                    spacing={2}
                    alignItems="center">

                    <Grid item sm={8}>
                        <Button variant={"contained"} color={"secondary"}
                                disabled={!isProducerActive || nextUserIndex >= userEntries.length}
                                onClick={sendEvent}>
                            Onboard New User
                        </Button>
                    </Grid>

                    <Grid item sm={4}>
                        <FormGroup>
                            <FormControlLabel control={<Switch defaultChecked onChange={toggleTraceMode}/>}
                                              label="Trace Mode"/>
                        </FormGroup>
                    </Grid>

                </Grid>
                {
                    nextUserIndex >= userEntries.length && <Alert severity="warning" style={{marginTop: "1rem"}}>
                        No more new users to onboard.
                    </Alert>
                }


            </Paper>
            <Paper elevation={3} variant={"outlined"} square={false} style={{padding: "1rem", marginTop: "2rem"}}
                   className={"consumer"}>

                <TableContainer>
                    <Table sx={{minWidth: 650}} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>User Name</TableCell>
                                {isDebugMode &&
                                    <>
                                        <TableCell align="right">Provisioned</TableCell>
                                        <TableCell align="right">Authorized</TableCell>
                                        <TableCell align="right">Notified</TableCell>
                                    </>
                                }
                                <TableCell align="right">Complete</TableCell>
                            </TableRow>
                        </TableHead>
                        {/* eslint-disable-next-line react/jsx-no-undef */}
                        <TableBody>
                            {sagaTraces.length > 0 && sagaTraces.map((row) => (
                                <TableRow
                                    key={row.name}
                                    sx={{'&:last-child td, &:last-child th': {border: 0}}}

                                >
                                    <TableCell component="th" scope="row">
                                        {row.name}
                                    </TableCell>
                                    {isDebugMode &&
                                        <>
                                            <TableCell align="right">{row.provisioned ?
                                                <CheckCircleOutline color="success"/> :
                                                <RadioButtonUncheckedIcon color="disabled"/>}</TableCell>
                                            <TableCell align="right">{row.authorized ?
                                                <CheckCircleOutline color="success"/> :
                                                <RadioButtonUncheckedIcon color="disabled"/>}</TableCell>
                                            <TableCell align="right">{row.notified ?
                                                <CheckCircleOutline color="success"/> :
                                                <RadioButtonUncheckedIcon color="disabled"/>}</TableCell>
                                        </>
                                    }
                                    <TableCell align="right">{row.complete ? <CheckCircleOutline color="success"/> :
                                        <RadioButtonUncheckedIcon color="disabled"/>}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {sagaTraces.length === 0 &&
                                <>
                                    <TableCell component="th" scope="row">
                                        <em>No new users onboarded yet</em>
                                    </TableCell>
                                    {isDebugMode &&
                                        <>
                                            <TableCell align="right"></TableCell>
                                            <TableCell align="right"></TableCell>
                                            <TableCell align="right"></TableCell>
                                        </>
                                    }
                                    <TableCell align="right"></TableCell>
                                </>
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                <Button variant={"outlined"} color={"info"} startIcon={<DeleteIcon/>}
                        disabled={Object.keys(sagaTraces).length === 0} onClick={clearTraces} sx={{marginTop: "1rem"}}>
                    Clear
                </Button>

            </Paper>
        </>
    )
}