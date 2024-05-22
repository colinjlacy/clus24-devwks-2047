import json
import struct
import time
from datetime import datetime

from flask import Flask, request
from flask_cors import CORS, cross_origin
from kafka import KafkaProducer

app = Flask(__name__)
cors = CORS(app)

producer = KafkaProducer(
    bootstrap_servers=[
        '127.0.0.1:9093', 
        '127.0.0.1:9094'
    ],
    value_serializer=lambda m:
        json.dumps(m).encode('utf-8'),
)


@app.post('/')
@cross_origin()
def receive_event():  # put application's code here
    request_data = request.get_json()
    request_data["produced"] = get_pretty_time_with_milliseconds()
    topic = "first-topic"
    if "topic" in request_data:
        topic = request_data["topic"]
    producer.send(topic, request_data)
    producer.flush(timeout=5)
    return ""


@app.route('/ping')
@cross_origin()
def ping():  # put application's code here
    return 'pong'


def get_pretty_time_with_milliseconds():
    """Returns the current time in a pretty format with milliseconds."""
    now = datetime.now()
    formatted = now.strftime("%H:%M:%S:%f")
    return formatted[:-3]


def user_lookup(id):
    users = {
        'elroy': {
            'id': 'elroy',
            'name': "Elroy Winterbone",
            'dept': "HR",
            'email': "elroy@company.com",
            'device': "linux"
        },
        'ursula': {
            'id': 'ursula',
            'name': "Ursula Higgenbothom",
            'dept': "Finance",
            'email': "ursula@company.com",
            'device': "ipad"
        },
        'wilhelm': {
            'id': 'wilhelm',
            'name': "Wilhelm Ghandt",
            'dept': "Operations",
            'email': "wilhelm@company.com",
            'device': "windows"
        },
        'indira': {
            'id': 'indira',
            'name': "Indira Bethel",
            'dept': "Finance",
            'email': "indira@company.com",
            'device': "mac"
        },
        'francisco': {
            'id': 'francisco',
            'name': "Francisco Oberon",
            'dept': "Finance",
            'email': "francisco@company.com",
            'device': "android"
        },
        'harmon': {
            'id': 'harmon',
            'name': "Harmon Iglesias",
            'dept': "HR",
            'email': "harmon@company.com",
            'device': "linux"
        },
        'mamoud': {
            'id': 'mamoud',
            'name': "Mamoud Albertson",
            'dept': "Operations",
            'email': "mamoud@company.com",
            'device': "linux"
        },
        'ingvar': {
            'id': 'ingvar',
            'name': "Ingvar Collins",
            'dept': "Finance",
            'email': "ingvar@company.com",
            'device': "windows"
        },
    }

if __name__ == '__main__':
    app.run()


