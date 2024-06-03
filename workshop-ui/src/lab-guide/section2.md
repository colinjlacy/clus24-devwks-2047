# Section 2: First Event Messages

## Setup

We'll need to make sure all of our dependencies are installed before we can run our `producer.py` and `consumer.py` files. 

The following set of commands creates and activates a fresh virtual environment, and then installs dependencies listed in the `requirements.txt` file:

#### Snippet 2.1
<span class="copy"></span>
```shell
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
```

Copy and paste these commands into your command line and then press enter. You'll see output logs showing each of the dependency packages being installed into your virtual environment. 

## Running the Producer

If you look to the left, you'll notice there's an indicator showing that this lab guide is looking for a Producer and can't seem to find it, which indicates that it's not running.  Let's solve that problem right now.

The `producer.py` file requires some configuration before we can run it. Lines 11-14 show the configuration data points necessary for running the consumer; however those data points are empty.  If we were to run this code right now, we would get an error.

Let's populate those configuration values so that we can set up a Producer connection to our Kafka cluster:

#### Snippet 2.2
<span class="copy"></span>
```python
producer = KafkaProducer(
    bootstrap_servers=[
        '127.0.0.1:9093', 
        '127.0.0.1:9094'
    ],
    value_serializer=lambda m:
        json.dumps(m).encode('utf-8'),
)
```

The first configuration, `bootstrap_servers`, tells our Python code where to look for Kafka brokers to connect to in order to *initialize* a connection.  Once the connection is made, the broker will tell the Producer all that it needs to know about the cluster, so that it can send events to any one of the brokers that are available.

The second configuration tells our code how to *serialize* the data it sends into a byte array - that is, how to convert it into a raw byte array.

**Be sure to save with `Ctrl+S`.**

With that configured, let's run the Producer by typing the following in a command line, in the local repo directory:

#### Snippet 2.3
<span class="copy"></span>
```shell
source venv/bin/activate &&
python3 producer.py
```

If your configuration was correct, the panel to the left should indicate that the Producer is online.  Nicely done!  The system should currently look like this:

<a href="images/s2.1.jpg" class="glightbox">
    <img src="images/s2.1.jpg" alt="A producer pushing data to a message bus"/>
</a>

In this section, we're working with the topic called `first-topic`, which is configured as the default topic in `producer.py`.

Click on the button to the left a few times to send some messages to the Kafka cluster. You can check in the <a href="http://localhost:8080/ui/clusters/local/all-topics/first-topic/messages?keySerde=String&valueSerde=String&limit=100" target="_blank">Kafka UI</a> tab to see the message count on the `first-topic` topic increase each time you click the button.

## Running the Consumer

Configuring the consumer requires a little more input, and this time, instead of hard-coding our configuration values, we'll pass in environment variables to set up our Kafka connection.

In the `consumer.py` file, you'll notice lines 18 - 22 have constants set by environment variables:

#### Snippet 2.4
```py
KAFKA_TOPIC = os.environ['KAFKA_TOPIC']
KAFKA_BOOTSTRAP_SERVERS = (
    os.environ["KAFKA_BOOTSTRAP_SERVERS"].split(",")
)
CONSUMER_GROUP = os.environ["CONSUMER_GROUP"]
```

When we run this file, we can pass in whatever values we want to ensure that this Consumer connects to the right Kafka cluster. To do that, we'll need to set those values when we run this file:

#### Snippet 2.5
<span class="copy"></span>
```sh
source venv/bin/activate && 
KAFKA_TOPIC="first-topic" \
KAFKA_BOOTSTRAP_SERVERS="localhost:9093,localhost:9094" \
CONSUMER_GROUP="first-group" \
python3 consumer.py
```

Once that's connected, you should see a log printed to the console saying, *"Starting consumer on topic first-topic, in group first-group"*. The system now looks like the following diagram:

<a href="images/s2.2.jpg" class="glightbox">
    <img src="images/s2.2.jpg" alt="A producer pushing data to a message bus, and a consumer receiving it"/>
</a>


Try clicking the **Send Event** button to the left a few times. Each time you do, the UI will send a POST request to the Producer, which will turn it into an Event that is sent to the `first-topic` topic in Kafka, and ultimately received by the Consumer. The UI, Producer, and Consumer will all each a time at which the event was handled.

> ### Discussion
> What do you notice about the timestamps between the different events? Specifically, is there a pattern that you notice about which step takes the longest?

### Compensating for Downtime

Let's experiment with the Consumer a bit.  Try shutting down the Consumer using `Ctrl+C`. Once it's no longer running, click the button to the left a three or four more times to send some events to Kafka.  

Now, restart the Consumer again with the following command (which you can probably just press the up button to recall):

#### Snippet 2.6
<span class="copy"></span>
```sh
source venv/bin/activate && 
KAFKA_TOPIC="first-topic" \
KAFKA_BOOTSTRAP_SERVERS="localhost:9093,localhost:9094" \
CONSUMER_GROUP="first-group" \
python3 consumer.py
```

**What do you notice?**  What benefit does this provide?

> ### Discussion
> What do you think made it possible for the Consumer to pick up messages that were sent when it was offline?
> 
> How does this compare to different system designs like service-to-service REST requests?

## Moving on

Leave the Producer and Consumer running, and click the button at the top or bottom of the page to move on to the next section.

<hr>

## Additional Information

### Bootstrap Servers

Even though we only need to connect to one broker to start that initial connection to the full cluster, it's always a good idea to give your Producers and Consumers more than one address to connect to.  If the first broker is down, the next address in the list will be used.

### Kafka Message Serialization

Kafka will only send raw bytes, so both the Producer and Consumer have to have a common understanding of how to read and process those bytes.  Other message bus solutions, like Kinesis and RabbitMQ, will accept data of any format and serialize it behind the scenes.  There are performance and implementation considerations for both approaches to serialization that are beyond the scope of this workshop.

### Using Environment Variables

We may be using this `consumer.py` file to connect to a local Kafka cluster; but because we're using environment variables to configure the connection, we can use this same file to connect to any Kafka cluster that is available and accessible.  This follows an approach known as **12-Factor**, which you can read more about here: [https://12factor.net/](https://12factor.net/).

### Asynchronous I/O

The `consumer.py` and `consumer-producer/cp.py` files both use a Kafka library called [aiokafka](https://github.com/aio-libs/aiokafka), which uses [asyncio](https://docs.python.org/3/library/asyncio.html) to consume events from Kafka. The reason this is so important, and the reason we're not using the long-standing [kafka-python](https://kafka-python.readthedocs.io/en/master/) library that is used in `producer.py`, is that topic consumption is a blocking process. That means the consumer function itself blocks anything else from happening (e.g. a RESTful API).      

## Troubleshooting the Producer

If the Producer does not show as connected, check your `KafkaProducer` configuration again, ensuring that it matches what's shown above. Also be sure to check that the RESTful endpoints in the Producer are correctly configured. There should be at least one `GET` endpoint listening at `http://localhost:5000/ping`, which the lab guide uses to determine if the Producer is available.

## Troubleshooting the Consumer

If the services aren't able to join their consumer groups, then it's likely a problem with the Kafka cluster itself - specifically the topics are assigned to brokers IDs that may not match the active broker IDs. This is usually because the Zookeeper container was run against multiple Kafka containers.  The best way to solve this is to kill *and delete* all of the containers related to the Kafka cluster, and then start it all up again using the Docker command listed above.