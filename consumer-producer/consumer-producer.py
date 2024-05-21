import asyncio
import json
import logging
import os
import random
from asyncio import Task
from datetime import datetime
from typing import Optional, List

import uvicorn
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer, errors
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

# GLOBAL VARIABLES
##################
consumers: Optional[List[AIOKafkaConsumer]] = []
producer: Optional[AIOKafkaProducer] = None
consumer_tasks: Optional[List[Task]] = []

# KAFKA CONSUMER CONFIGURATION
##############################
consumer_topics = os.environ.get('CONSUMER_TOPICS').split(",")
producer_topic = os.environ.get('PRODUCER_TOPIC')
received_messages = {}
for topic in consumer_topics:
    received_messages[topic] = []

KAFKA_BOOTSTRAP_SERVERS = (
    os.environ.get('KAFKA_BOOTSTRAP_SERVERS').split(",")
)
CONSUMER_GROUP = os.environ.get('CONSUMER_GROUP')


# KAFKA CONSUMER/PRODUCER FUNCTIONALITY
#######################################
async def initialize_consumer():
    global producer
    producer = AIOKafkaProducer(
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        value_serializer=lambda m: json.dumps(m).encode('utf-8')
    )
    print("starting producer")
    await producer.start()
    print("producer started")
    global consumers

    for i, tpc in enumerate(consumer_topics):
        consumers.append(AIOKafkaConsumer(
            tpc,
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            group_id=CONSUMER_GROUP  # This will enable Consumer Groups
        ))
        print(f"starting consumer for topic {tpc}")

        await consumers[i].start()
        print(f"consumer {i} started")

async def read_incoming_messages(kafka_consumer):
    try:
        async for msg in kafka_consumer:
            log.info(f"Consumed msg: {msg}")
            await handle_event(msg)
    except errors.KafkaError:
        log.exception(f'Kafka error {errors.KafkaError}')
    except Exception:
        log.exception(f'General error {Exception}')
    finally:
        log.warning('Stopping consumer')
        await kafka_consumer.stop()


async def consume():
    global consumer_tasks
    for c in consumers:
        consumer_tasks.append(asyncio.create_task(read_incoming_messages(c)))


# INITIALIZING LOGGER
#####################
logging.basicConfig(format='%(asctime)s - %(levelname)s - %(message)s',
                    level=logging.INFO)
log = logging.getLogger(__name__)


async def handle_event(event):
    if event.topic == "notified":
        val = event.value
        val["notified"] = True
        received_messages["notified"].append(val)
        return

    await asyncio.sleep(random.random() * 5)
    received_messages[event.topic].append(event.value)
    new_msg = {'id': event.value['id'], 'errors': event.value['errors']}
    if event.topic == "new-user":
        if event.value["errors"] is not None and event.value["dept"] == "Finance":
            return await producer.send(
                os.environ.get('ERRORS_TOPIC', 'dlq'),
                {
                    'id': event.value['id'],
                    'service': 'Provisioner',
                    'error': f'user {event.value["id"].capitalize()} is invalid; could this be a security breach?'
                }
            )
        else:
            new_msg['device_id'] = int(round(datetime.now().timestamp()))
    elif event.topic == "notify":
        if event.value["errors"] is not None and should_raise_error():
            return await producer.send(
                os.environ.get('ERRORS_TOPIC', 'dlq'),
                {
                    'id': event.value['id'],
                    'service': 'Notifier',
                    'error': f'could not find LDAP account for user {event.value["id"].capitalize()}'
                }
            )
        else:
            new_msg['notified'] = True
    elif event.topic == "authorize":
        if event.value["errors"] is not None and should_raise_error():
            return await producer.send(
                os.environ.get('ERRORS_TOPIC', 'dlq'),
                {
                    'id': event.value['id'],
                    'service': 'Authorizer',
                    'error': f'device id {event.value["device_id"]} for user {event.value["id"].capitalize()} requires security updates, cannot authorize'
                }
            )
        else:
            new_msg['device_id'] = event.value['device_id']
            new_msg['authorized'] = True
    await producer.send(producer_topic, new_msg)


def should_raise_error():
    return random.random() > 0.9


# API FUNCTIONALITY
###################
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins="*",
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    log.info('Initializing API ...')
    await initialize_consumer()
    await consume()


@app.on_event("shutdown")
async def shutdown_event():
    log.info('Shutting down API')
    for task in consumer_tasks:
        task.cancel()
    for consumer in consumers:
        await consumer.stop()


@app.get("/")
async def list_messages():
    global received_messages
    data = received_messages

    received_messages = {}
    for tpc in consumer_topics:
        received_messages[tpc] = []
    return data


@app.get("/ping")
async def ping():
    return "pong:{}".format(CONSUMER_GROUP)


# APPLICATION STARTUP
#####################
if __name__ == "__main__":
    print("running")
    uvicorn.run(app, host="0.0.0.0", port=os.environ.get("PORT", 8000))
