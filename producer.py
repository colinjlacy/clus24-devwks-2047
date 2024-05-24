import json
from datetime import datetime

from flask import Flask, request
from flask_cors import CORS, cross_origin
from kafka import KafkaProducer

app = Flask(__name__)
cors = CORS(app)

producer = KafkaProducer(
    bootstrap_servers=[],
    value_serializer=None
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


if __name__ == '__main__':
    app.run()


