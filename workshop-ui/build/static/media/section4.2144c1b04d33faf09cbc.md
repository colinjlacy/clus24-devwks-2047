# Section 4: The Saga Pattern

In this section, we'll look at the Saga Pattern, which is a more complex approach to EDA than anything we've looked at before. Before we dive in, there are two concepts that we need to get familiar with first.

## Chained Events

One of the most common approaches in EDA is to chain events together. This creates asynchronous workflows that allow us to use multiple single-responsibility services to add value in a composable workflow.

So far, we've looked at our services as either a *consumer* or *producer*:

<a href="images/s4.4.jpg" class="glightbox">
    <img src="images/s4.4.jpg" alt="One producer, one consumer"/>
</a>

We're now going to start chaining events, meaning that a consumer can also subsequently be a producer for more downstream events:

<a href="images/s4.5.jpg" class="glightbox">
    <img src="images/s4.5.jpg" alt="A consumer producing an event to a downstream consumer"/>
</a>

> ### Discussion
> Is there a limit to how many events we can chain together?

## Consuming From Multiple Topics

The key to the Saga Pattern is that the same service that created the Saga is also the final service in the Saga. It raises the initial event, and is the destination for the complete workflow.

In order to do that, it's likely going to have to consume multiple topics in parallel.  In its most simple form, the concept looks like this: 

<a href="images/s4.3.jpg" class="glightbox">
    <img src="images/s4.3.jpg" alt="A consumer watching two topics simultaneously"/>
</a>

> ### Discussion
> What are the risks of having a single consumer pull from multiple topics?

## Our Pre-Packaged Consumers

Now that we've gotten hands-on with running our own consumers, it's time to experiment with the pre-packaged consumers.

When we first got started with this lab, we ran the Docker containers needed to power our Kafka cluster.  Now let's run some additional containers, which will help us illustrate the Saga pattern:

#### Snippet 4.1
<span class="copy"></span>
```shell
docker compose up \
  provisioner authorizer notifier --no-recreate
```

This will stand up three services that we haven't yet discussed:
- **the Provisioner** listening on the `new-user` and `notified` topics
- **the Authorizer** listening on the `authorize` topic
- **the Notifier** listening on the `notify` topic

> ### Discussion
> Why have such generic topics like `authorize` and `notify`?

We're going to simulate a workflow in which a list of new users are onboarded into our company into various departments, and we want to provision an appropriate device for them, provide necessary authorizations, and notify them that they've been granted access based on their department.

Since this is a workshop, each of these steps will be mocked.  But the resulting behavior will mimic real-life event-driven architecture, *including unpredictable lag*.

These services will be used to create a mock workflow in which:
1. A device is provisioned for a new user - this takes place in the Provisioner, and is the start of the Saga
2. The new event is raised which includes the new user's info and the device ID 
3. The Authorizer receives the event, and issues appropriate authorizations based on the user's department
4. An event is then raised to notify the new user of their new authorizations
5. The Notifier receives the event and sends the new user an email
6. An event is raised indicating that the new user has been notified
7. The Provisioner receives the event indicating that the user has been notified and notes the saga as complete for that user

## Asynchronous Event Flows

To the left, you'll see that there's a toggle for **Trace Mode**, which should be enabled to start.  While this is on, any data that you send will be tracked across the different consumers, as they receive events in their step in the workflow. The overall architecture of this system looks like this:

<a href="images/s4.1.jpg" class="glightbox">
    <img src="images/s4.1.jpg" alt="Saga Pattern with trace GET requests"/>
</a>

While Kafka guarantees that events will arrive in a first-in, first-out (FIFO) pattern, there's nothing that guarantees that our individual services will finish processing each event in order, especially if we have multiple instances of each consumer in a group.

Click the **New User** button a few times to see how data flows asynchronously across the different services.

Note that the different sets of data don't complete in order. This is likely to happen in a production environment, in which multiple producers and consumer groups are handling hundreds or even thousands of data points every second.  The asynchronous steps involved are going to introduce different types of lag that will change the time it takes for each saga to run its course.

> ### Discussion
> What are some use cases that you can think of that may introduce noticeable lag to an event-driven system?

## Lack of Visibility

In a production environment, you likely won't be monitoring each and every step of an event-driven architecture.  

To create a more realistic simulation, let's turn **Trace Mode** off.  That will remove visibility into the various steps, and we will *only see the final result once the saga has completed for each new user*.

<a href="images/s4.2.jpg" class="glightbox">
    <img src="images/s4.2.jpg" alt="Saga Pattern with little visibility"/>
</a>

Click the **New User** button a few more times to see the saga pattern at work without being able to trace events as they're passed between services.  

It's not exactly comforting, not being able to know what's happening behind the scenes, is it?

> ### Discussion
> If something goes wrong, how (and when) would you know?

## Moving on

Leave the Producer and these Saga services running, as we're going to build on this setup in the next section.  When you're ready, click the button below to move to the next section.

<hr>

## Additional Information

### Single-Responsibility Services

The benefit of single-responsibility services (e.g. services listening to generic topics such as `authorize` or `notify`) is that these services can be used for multiple, composable workflows.  Ideally your services should be *as reusable as possible* for simple tasks, and can consume from any producer that pushes data to the topics that they're listening to.

### Closed vs Open Loop Sagas

In this section, we looked at a *closed-loop* saga, meaning every event contributed to the completion of the saga in question.  Alternatively, an open-loop could spawn events with downstream consumers that are not part of the saga.  This makes for a more complex system, but also increases the potential for workflow automation as different patterns are merged for composable logic.

### Fully vs Partially Automated Systems

Usually we want our event-driven systems to automate as much of a workflow as possible.  However, it is entirely valid to create a partially-automated system, with a manual step being added to a certain part of the workflow.  Ticketing systems - e.g. helpdesk ticket tracking - are an example of a partially-automated workflow. A ticket ca be created, categorized, prioritized, and assigned using chained events, but the actual work on that ticket is manual.  Once the ticket is marked as complete, a notification can be sent to the stakeholder, analytics can be performed on the ticket time, and a new ticket can be assigned, all with downstream automation. 

## Troubleshooting the Docker Services

If you're having trouble getting events to show up in the trace table above, there may be a problem with your Docker containers.  Make sure that when you stand up the different containers, you run the command as it is shown above.  The services for this section are not meant to be spun up at the same time as the core Kafka services, as there is a delay in Kafka coming up vs being consumer-ready that causes the saga-focused services to crash.

Alternatively, (and this is repeated from Section 2) if the services aren't able to join their consumer groups, then it's likely a problem with the Kafka cluster itself - specifically the topics are assigned to brokers IDs that may not match the active broker IDs. This is usually because the Zookeeper container was run against multiple Kafka containers.  The best way to solve this is to kill all of the containers related to the Kafka cluster, and then start it all up again using the Docker command listed in Section 2.   