# Section 3: Consumer Groups

In this section we'll experiment with Consumer Groups to see how multiple consumers handle events on the same topic.

You should see on the left that both the Producer and existing Consumer are running. Leave them running, as we're going to focus on getting the second Consumer online.

## Same Group, High Availability

Let's open a new command line window in the same directory as our Python files. In this new command line, start another Consumer using the same `consumer.py` file.

We'll use the same Kafka configuration environment variables, but we'll also add a new one that specifies the port that we'll connect to in order to pull the consumed events:

<span class="copy"></span>
```sh
KAFKA_TOPIC="first-topic" \
KAFKA_BOOTSTRAP_SERVERS="localhost:9093,localhost:9094" \
KAFKA_GROUP="first-group" \
PORT=8001 \
python consumer.py
```

Once both Consumers are up and running, you should see them both display their group as `first-group`. If not, check the environment variables that you passed in to ensure that they're identical to what's shown above.

Click the **Send Event** button a few times and watch what happens.  You'll notice that the events are split between the two Consumers!  That's because Kafka (and other message buses like it) distribute events between the Consumers in a Consumer Group. There are various ways to configure how events are distributed, but in this case, we're just using the default, which is a roughly even distribution.

Now, shut down the Second Consumer using `Ctrl+C`, and click the **Send Event** button a few more times. The First Consumer will now receive *all of the events*!  Kafka is smart enough to know how many Consumers in each group are listening, and can adjust if one goes down. 

## Different Groups, the Fan-Out Pattern

Let's start the Second Consumer again, but this time in a different Consumer Group:

<span class="copy"></span>
```sh
KAFKA_TOPIC="first-topic" \
KAFKA_BOOTSTRAP_SERVERS="localhost:9093,localhost:9094" \
KAFKA_GROUP="second-group" \
PORT=8001 \
python consumer.py
```

Once the UI shows the Second Consumer is online, you'll see `second-group` displayed in orange.

Now when you click the **Send Event** button, both consumers will receive the same event! That's because they're in two different Consumer Groups listening on the same topic. Each Consumer Group will receive the events on the `first-topic` once. This is a very basic implementation of what's known as the **Fan-Out Pattern**.

We'll experiment more with the Fan-Out Pattern in the next sections.  For now, notice how each Consumer receives and processes the same event in parallel, adding its own `consumed` time to the event before it is read back by the UI. 