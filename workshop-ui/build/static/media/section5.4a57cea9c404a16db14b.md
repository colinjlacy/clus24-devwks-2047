# Section 5: Fan-In and the DLQ

In our last section, we'll look at two patterns:
- The Dead-Letter Queue (aka the DLQ)
- Fan-In (of which the DLQ is an implementation)


## Dead-Letter Queue

In an event-driven system, there's generally no user or admin watching events flow through different services to keep track of their progress and success.  That means that if an error happens and stops the flow of events, no one is watching to triage and remediate the problem.

That's where a **Dead-Letter Queue** (or DLQ for short) comes in, which is usually (at least) one dedicated *topic* that system designers will add to their message bus, allowing any number of services to send their error events so that they can be aggregated and tracked.

Most event-driven systems will have more than one DLQ, but a minimum of one is usually the starting point for handling errors.

> ### Discussion
> How does this compare to error handling in a RESTful system?

### Dead-Letter Queue in Action

We'll use the same three services that we used in Section 4 to demo the Saga Pattern. However, in this section, they will raise errors in their workflow. This will happen automatically, in order to simulate real-life errors that can arise in your event-driven architecture.

We'll also come back to `consumer.py`, and we'll configure it to listen on the topic `dlq`. In a terminal window, run the following command:

<span class="copy"></span>
```sh
source venv/bin/activate && 
KAFKA_TOPIC="dlq" \
KAFKA_BOOTSTRAP_SERVERS="localhost:9093,localhost:9094" \
CONSUMER_GROUP="error-group" \
PORT=8084 \
python3 consumer.py
```

The **Users** display is a simplified version of what we used in Section 4, simply meant to show users in either the *pending* or *complete* state.

Once everything is running, click the button to the left to send a few users to be onboarded. Feel free to send all 10 users if you like!

Since we're using the same services, there will be the same built-in delay in how the users are onboarded.

Some of these users are going to take longer than others, and *some will never complete*. Take a look at the **Errors** tab to see if any of those *pending* users are in an error state.


### Behind the Scenes

Each of the services in the Saga has a possibility of raising errors to the `dlq` topic, which will then arrive at the Consumer we started at the beginning of this section. The full system looks like this:

<a href="images/s5.1.jpg" class="glightbox">
    <img src="images/s5.1.jpg" alt="Dead-letter queue integrated into the saga pattern"/>
</a>

While there's *technically* not a lot of new information provided here, it's important to note that error handling is one of the most crucial aspects of an event-driven system, and the DLQ is arguably the most common pattern of any event-driven architecture.

> ### Discussion
> We're ending our event flow at the error consumer. Are there other things that we could do instead?
>
> Do you think it might be a good idea to have multiple error topics in some situations?

## Fan-In

The DLQ is a common implementation of a more generic pattern, known as the **Fan-In Pattern**. This is when multiple producers push events to a single topic, with one consumer-group receiving and aggregating the resulting events.

<a href="images/s5.2.jpg" class="glightbox">
    <img src="images/s5.2.jpg" alt="Fan-in pattern"/>
</a>

In our implementation, we're using a single instance of a consumer, and aggregating the events in-memory.  In a production environment, you're more likely to see multiple consumer instances, with the aggregation happening in a data persistence layer - i.e. a database.

<a href="images/s5.3.jpg" class="glightbox">
    <img src="images/s5.3.jpg" alt="Fan-in pattern with persistence layer"/>
</a>

You may notice that this builds on system design that was shared in the **Additional Information** part of Section 2.

> ### Discussion
> Based on what we've seen here, and the diagram above, what do you think is a good use case for the fan-in pattern?

## Closing Up

At this point, we can shut down all of our services.  Use `Ctrl-C` to shut down `producer.py` and `consumer.py`, and then run `docker-compose down` to shut down all of the Docker services used in this workshop.

## Additional Information

### DLQ Segmentation

A common way to segment DLQs is to separate certain errors according to who (that is, which teams, or which stakeholders) are interested in those errors.  That likely means which teams will be responsible for triaging and remediating those errors.  

Another approach is to segment based on possible downstream action.  That is, if it's a manual remediation, or if there are possible downstream consumers and additional automation.  

## Troubleshooting the Error Consumer

If your errors are not showing up, be sure you ran the command exactly as it's listed above, paying particular attention to the `PORT` environment variable.  Each section connects the consumer on a different port to ensure that the consumer is configured for that section. Using a port from a previous section, or using the default port, will not work correctly for this section.  