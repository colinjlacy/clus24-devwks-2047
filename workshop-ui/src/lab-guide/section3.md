# Section 3: Consumer Groups

In this section we'll experiment with Consumer Groups to see how multiple consumers handle events on the same topic.

You should see on the left that both the Producer and existing Consumer are running. Refer back to the previous section if you need to stand them up again.

## Multiple Consumers in the Same Group

We're going to start another Consumer using the same `consumer.py` file. 

Let's open a new command line window in the same directory as our Python files. We'll use the same Kafka configuration environment variables, but we'll also add a new one that specifies the port that we'll connect to in order to pull the consumed events:

<span class="copy"></span>
```sh
KAFKA_TOPIC="first-topic" \
KAFKA_BOOTSTRAP_SERVERS="localhost:9093,localhost:9094" \
CONSUMER_GROUP="first-group" \
PORT=8001 \
python3 consumer.py
```

Once both Consumers are up and running, you should see them both display their group as `first-group` in blue text. If not, check the environment variables that you entered to ensure that they're identical to what's shown above.

The system now looks like this:

<a href="images/s3.1.jpg" class="glightbox">
    <img src="images/s3.1.jpg" alt="Multiple consumers in the same consumer group"/>
</a>

Click the **Send Event** button a few times and watch what happens.  You'll notice that the events are split between the two Consumers!  That's because Kafka (and other message buses like it) distribute events between the Consumers in a Consumer Group. 

There are various ways to configure how events are distributed, but in this case, we're just using the default, which is a *roughly* even distribution.

> ### Discussion
> What is the benefit of having multiple consumer instances in the same group?
> 
> Do you think there's a limit as to how many consumer instances can exist in the same group?

### Downscaling (or Crashing) an Instance

Now, shut down the Second Consumer using `Ctrl+C`, and click the **Send Event** button a few more times. 

**What do you notice happens?**

> ### Discussion
> What do you think this means in terms of good practices for high availability?
> 
> What challenges does this create for data unification? (More on this below)

## Different Groups, the Fan-Out Pattern

Let's start the Second Consumer again, but this time in a **different Consumer Group**:

<span class="copy"></span>
```sh
KAFKA_TOPIC="first-topic" \
KAFKA_BOOTSTRAP_SERVERS="localhost:9093,localhost:9094" \
CONSUMER_GROUP="second-group" \
PORT=8001 \
python3 consumer.py
```

Once the UI shows the Second Consumer is online, you'll see `second-group` displayed in orange.  Our system now looks slightly different:

<a href="images/s3.2.jpg" class="glightbox">
    <img src="images/s3.2.jpg" alt="Two consumers in different consumer groups"/>
</a>

Now click the **Send Event** button

Each Consumer Group will receive the events on the `first-topic` once. This is a very basic implementation of what's known as the **Fan-Out Pattern**.

Notice how each Consumer receives and processes the same event in parallel, adding its own `consumed` time to the event before it is read back by the UI.

> ### Discussion
> What are some use cases of the fan-out pattern that you can think of?
> 
> What do you think are some trade-offs to consider as you scale to more parallel consumers on a topic?

## Moving on

Leave the Producer running, but shut down both of the Consumers with `Ctrl+C`.  When you're ready, click the button below to move to the next section.

<hr>

## Additional Information

### Data Unification Within a Consumer Group

If each consumer in a group is tracking its own list of events, we'll have to figure out a mechanism to unify the sum of both consumers' data into a single list.  This is usually done with a data store that both consumers are pushing data into:

<a href="images/s3.5.jpg" class="glightbox">
    <img src="images/s3.5.jpg" alt="Both consumers push data into a database"/>
</a>

### Scaling Concerns

The following architecture depicts a significantly scaled-out fan-out pattern:

<a href="images/s3.3.jpg" class="glightbox">
    <img src="images/s3.3.jpg" alt="Scaled-out fan-out"/>
</a>

Each consumer group has to be tracked by the brokers, which means more work is being done on this topic.  This is a valid approach, *if each consumer will really use each event coming through*.

### Segmented Fan-Out

It's more likely that there are going to be ways to segment the fan-out, meaning that slight differences in what each consumer from the events they receive will allow you to break up a large fan-out into smaller segments:

<a href="images/s3.4.jpg" class="glightbox">
    <img src="images/s3.4.jpg" alt="Segmented fan-out"/>
</a>

## Troubleshooting the Consumers

If you notice that only one consumer is receiving messages when both consumers are running in the same consumer group, here are some things to look out for:
- First check that both Kafka brokers are running.  Run `docker ps -f "name=kafka"` in a Terminal window to see the status of the Kafka containers.
- Check to ensure that `first-topic` is configured to have **2 Partitions** and a **Replication Factor of 2**.  You can edit this in the [Kafka-UI](http://localhost:8080) by clicking into the Topics panel, selecting `first-topic`, and clicking *Edit Settings* under the three-dot menu in the top-right.