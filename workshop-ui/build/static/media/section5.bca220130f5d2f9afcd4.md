# Section 5: Fan-In and the DLQ

In our last section, we'll look at two patterns:
- The Dead-Letter Queue (aka the DLQ)
- Fan-In (of which the DLQ is an implementation)

## Setup:

We'll use the same three services that we used in Section 4 to demo the Saga Pattern. However, in this section, they will raise errors in their workflow. This will happen automatically, in order to simulate real-life errors that can arise in your event-driven architecture.

We'll also come back to our consumer, and we'll configure it to listen on the topic `dlq`. In a terminal window, run the following command:

<span class="copy"></span>
```sh
KAFKA_TOPIC="dlq" \
KAFKA_BOOTSTRAP_SERVERS="localhost:9093,localhost:9094" \
KAFKA_GROUP="error-group" \
PORT=8084
python consumer.py
```

## Dead-Letter Queue

In an event-driven system, there's generally no user or admin watching events flow through different services to keep track of their progress and success.  That means that if an error happens and stops the flow of events, no one is watching to triage and remediate the problem.

That's where a **Dead-Letter Queue** (or DLQ for short) comes in, which is usually a dedicated *topic* that system designers will add to their message bus, allowing any number of services to send their error events so that they can be aggregated and tracked. 

Most event-driven systems will have more than one DLQ, but a minimum of one is usually the starting point for handling errors. 

### Dead-Letter Queue in Action

Once everything is running, click the button to the left to send a few users to be onboarded. Feel free to send all 10 users if you like!

The **Users** display is a simplified version of what we used in Section 4, simply meant to show users in either the *pending* or *complete* state.

Since we're using the same services, there will be the same built-in delay in how the users are onboarded, and you'll notice them start to complete out of order.

Some of these users are going to take longer than others, and some will never complete. Let's take a look at the **Errors** tab and see if any of those *pending* users are in an error state.

### Behind the Scenes

Each of the services in the Saga has a possibility of raising errors to the `dlq` topic, which will then arrive at the Consumer we started at the beginning of this section. The full system looks like this:

<a href="images/s5.1.jpg" class="glightbox">
    <img src="images/s5.1.jpg" alt="Dead-letter queue integrated into the saga pattern"/>
</a>

## Fan-In

The DLQ is a common implementation of a more generic pattern, known as the **Fan-In Pattern**.

<a href="images/s5.2.jpg" class="glightbox">
    <img src="images/s5.2.jpg" alt="Fan-in pattern"/>
</a>

In the Fan-In Pattern, multiple producers push events to a single topic, with one consumer-group receiving and aggregating the resulting events.  In our implementation, we're using a single instance of a consumer, and aggregating the events in-memory.  In a production environment, you're more likely to see multiple consumer instances, with the aggregation happening in a data persistence layer - i.e. a database.

<a href="images/s5.3.jpg" class="glightbox">
    <img src="images/s5.3.jpg" alt="Fan-in pattern with persistence layer"/>
</a>