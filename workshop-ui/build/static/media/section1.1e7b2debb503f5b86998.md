# Section 1: Welcome and Setting Up

Thanks for joining!  In this section we'll set up our lab environment in our local environment, and take a look at what has been provided for us.

## Lab Guide and Conventions

### Layout

In this lab, there are multiple sections that each focus on one or two aspects of event-driven architecture.  You'll typically find some interactive content on the left, and text/images/code snippets provided on the right.  Feel free to read as you go, or follow along.

### Navigation

Each of the five sections in this workshop has its own page.  You can use the buttons at the top or bottom of each section to progress through the workshop, or use the hamburger menu in the top left corner to jump to any section you like.

### Images

All of the images in the provided text are viewable in a pop-out window, which will show those images at their full size.  Some of the images that you'll come across are no bigger than what is displayed in the guide, while others are much bigger, and are better when viewed in their expanded display.

### Copying Code Snippets

There are code snippets that are shared as examples, and other snippets that are meant to be copied and used in your code or command line.  The ones that are intended to be copied come with a *copy* icon.  Clicking on that icon will copy the contents of the snippet to the clipboard for you, so you can just paste it wherever you need to. 

Here's an example:

<span class="copy"></span>
```sh
echo "Cisco Live!"
```

## Kafka and Friends
Let's start by looking at the `docker-compose.yaml` file.  It comes with seven services that we will use throughout this lab:
- `zookeeper`: this is a management/orchestration service that configures our Kafka brokers to work together. Although it is necessary to run Kafka, we won't interact with this at all during this workshop.
- `kafka1` and `kafka2`: these are our Apache Kafka brokers, to which our Producers and Consumers will connect to pass messages to each other.
- `kafka-ui`: an extremely useful tool that allows us to visualize what's happening inside our Kafka cluster.
- `provisioner`, `authorizer`, and `notifier`: three consumer/producers that we'll use to illustrate the saga pattern in Section 4.

## The Python Files

There are three Python files in this repo as well, which we'll start interacting with in the next section.
- `producer.py` is a very small file (less than 60 lines!), and comes with a single REST endpoint, as well as a Kafka connection for *producing* event messages to a topic.  Once we configure this file, we'll use it for the duration of the lab.
- `consumer.py` receives event messages from a specific topic stores them in memory for retrieval via a REST endpoint. This one is a little more complex than `producer.py`, making use of the `asyncio` Python library to juggle multiple tasks at a time.
- `consumer-producer/cp.py` is the file that was used to create the `provisioner`, `authorizer`, and `notifier` services mentioned above. We won't look at the code in this file, but it's included for you to look at offline, if you'd like to see how the sandbox services work under the hood.

## Running the Kafka Cluster

When you're ready, open a command line and navigate to the repo you just cloned, which houses this lab guide.  Then, run the following command to start the Kafka Cluster and its associated components:

<span class="copy"></span>
```sh
docker-compose up \
  kafka-ui zookeeper kafka1 kafka2
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
      KAFKA_CREATE_TOPICS: "first-topic:2:2,fanout-topic:2:2,new-user:2:2,authorize:2:2,notify:2:2,notified:2:2,dlq:2:2"
```

If you were experimenting outside of this lab and wanted to create and configure more topics, you could delete the existing container, add more topics to this comma-separated list, and then recreate the container via the `docker-compose` command. **Note:** you have to delete the previous container in order for the new topics to be created.
