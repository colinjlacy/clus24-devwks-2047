import * as React from "react";
import {useEffect, useState} from "react";
import axios from "axios";
import {PRODUCER_URL, FIRST_CONSUMER_URL, POLLING_INTERVAL} from "../config/constants";
import Typography from "@mui/material/Typography";
import Paper from '@mui/material/Paper';
import {Button, List, ListItem, ListItemText} from "@mui/material";
import {ProducerService} from "../services/producer.srvc";
import DeleteIcon from '@mui/icons-material/Delete';


export default function Section2(props: {active: boolean}) {
    const [isProducerActive, setProducerActive] = useState(true);
    const [isConsumerActive, setConsumerActive] = useState(true);
    const [consumerList, setConsumerList] = useState<any[]>([]);
    const [currentEventId, setCurrentEventId] = useState<number>(1);
    useEffect(() => {
        const producerInt = setInterval(() => {
            if (!props.active) {
                setConsumerList([])
                return
            }
            axios.get(`${PRODUCER_URL}/ping`).then(res => {
                if (res.status === 200) {
                    setProducerActive(true)
                    console.log("section 2 producer running")
                }
            }).catch(() => {
                setProducerActive(false)
                console.log("producer down")
            });
        }, POLLING_INTERVAL)
        const consumerInt = setInterval(() => {
            if (!props.active) return
            axios.get(`${FIRST_CONSUMER_URL}/ping`).then(async res => {
                if (res.status === 200) {
                    setConsumerActive(true)
                    const cRes = await axios.get(`${FIRST_CONSUMER_URL}`)
                    if (cRes.status === 200) {
                        const items: string[] = []
                        cRes.data.forEach((item: {[key: string]: string}) => {
                            let str = ""
                            Object.keys(item).forEach((key: string) => {
                                if (str.length !== 0) str += "; "
                                str += `${key}: ${item[key]}`
                            })
                            items.unshift(str)
                        })
                        setConsumerList((prev: any[]): any[] => [...items, ...prev])
                    }
                }
            }).catch(() => {
                setConsumerActive(false)
                console.log("consumer down")
            });
        }, POLLING_INTERVAL)
        return function () {
            clearInterval(producerInt);
            clearInterval(consumerInt);
            setConsumerList([])
        }
    }, [props.active]);

    async function sendEvent() {
        await ProducerService.postEvent({
            id: currentEventId,
            clicked: ProducerService.getPrettyTime()
        })
        setCurrentEventId(currentEventId + 1)
    }

    function clearConsumerData() {
        setConsumerList([])
    }

    return (
        <>
            <Paper elevation={3} variant={"outlined"} square={false} style={{padding: "1rem"}}>

                <Typography variant="h4" gutterBottom>
                    Producer: {!isProducerActive && "Offline"}
                </Typography>

                <Typography paragraph>
                    Click the button below to send a POST request that will be converted to an Event by the Producer.
                </Typography>

                <Typography paragraph style={{fontWeight: "bold"}}>
                    Events sent: {currentEventId - 1}
                </Typography>

                <Button variant={"contained"} color={"secondary"} disabled={!isProducerActive} onClick={sendEvent}>
                    Send Event
                </Button>
            </Paper>
            <Paper elevation={3} variant={"outlined"} square={false} style={{padding: "1rem", marginTop: "2rem"}} className={"consumer"}>

                <Typography variant="h4" gutterBottom>
                    Consumer: {!isConsumerActive && "Offline"}
                </Typography>

                <Typography paragraph>
                    The following events were received by the Consumer.
                </Typography>
                <List>
                    {
                        consumerList.length !== 0 && consumerList.map((event: string, ind: number) => (
                            <ListItem key={ind}>
                                <ListItemText
                                    primary={event}
                                />
                            </ListItem>
                        ))
                    }
                    {
                        consumerList.length === 0 && <ListItem>
                            <ListItemText
                                primary="No events received yet"
                            />
                        </ListItem>
                    }
                </List>
                <Button variant={"outlined"} color={"info"} startIcon={<DeleteIcon />} disabled={consumerList.length === 0} onClick={clearConsumerData} sx={{marginTop: "1rem"}}>
                    Clear
                </Button>

            </Paper>
        </>
    )
}