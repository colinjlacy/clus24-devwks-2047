# Section 1: Setting Up

In this section we'll set up our lab environment in our local environment, and take a look at what has been provided for us.

## Kafka and Friends
Let's start with the `docker-compose.yaml` file.  It comes with six services that will run when we execute `docker-compose up`:
- `zookeeper`: this is a management/orchestration service that configures our Kafka brokers to work together. Although it is necessary to run Kafka, we won't interact with this at all during this workshop.
- `kafka1` and `kafka2`: these are our Apache Kafka brokers, to which our Producers and Consumers will connect to pass messages to each other.
- `inventoryConsumer` and `notificationsConsumer`: these are Consumer services that each handle the same event in different ways, and give us a way to see what event messages they've received.
- `kafka-ui`: an extremely useful tool that allows us to visualize what's happening inside our Kafka cluster

## The Python Files

There are three Python files in this repo as well, which we'll start interacting with in the next section.
- `producer.py` is a very small file (less than 60 lines!), and comes with a single REST endpoint, as well as a Kafka connection for *producing* event messages to a topic.  Once we configure this file, we'll use it for the duration of the lab.
- `consumer.py` receives event messages from a specific topic and prints them out to a running console via the `print` function. This one is a little more robust, making use of the `asyncio` Python library to juggle multiple tasks at a time. 

## Running the Kafka Cluster

When you're ready, open a command line and navigate to the repo you just cloned, which houses this lab guide.  Then, run the following command to start the Kafka Cluster and its associated components:

<span class="copy"></span>
```sh
docker-compose up
```

Let's make sure everything is up and running by diving into the [Kafka UI](http://localhost:8080).

The first thing you should see is a Dashboard with a single cluster listed, which is called `local`:

<a href="images/s1.1.png" class="glightbox">
    <img src="images/s1.1.png" alt="Kafka UI Dashboard"/>
</a>

On the left, you'll see a navigation menu for this cluster.  If you click on **Topics**, you'll see that several topics were already created for you:

<a href="images/s1.2.png" class="glightbox">
    <img src="images/s1.2.png" alt="Two topics already created"/>
</a>

Those were configured in the `docker-compose.yml` file, in the section that defined the `kafka1` and `kafka2` containers:
```yaml
kafka1:
    image: wurstmeister/kafka:2.13-2.8.1
    container_name: kafka1
    # ...
    environment:
      # ...
      KAFKA_CREATE_TOPICS: "first-topic:2:2,Topic2:2:1"
```

If you were experimenting outside of this lab and wanted to create and configure more topics, you could delete the existing container, add more topics to this comma-separated list, and then recreate the container via the `docker-compose` command. **Note:** you have to delete the previous container in order for the new topics to be created.
