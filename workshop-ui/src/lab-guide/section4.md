# Section 4: The Saga Pattern

One of the most common approaches in EDA is to chain events together. This creates asynchronous workflows that allow us to use multiple single-responsibility services to add value in a composable workflow.

The key to the Saga Pattern is that the same service that created the Saga is also the final service in the Saga. It raises the initial event, and is the destination for the complete workflow.

## Our Pre-Packaged Consumers

Now that we've gotten hands-on with running our own consumers, it's time to experiment with the pre-packaged consumers.

The `docker-compose.yaml` file that was provided includes three services that we haven't yet discussed:
- **the Provisioner** listening on the `new-user` and `notified` topics
- **the Authorizer** listening on the `authorize` topic
- **the Notifier** listening on the `notify` topic

We're going to simulate a workflow in which a list of new users are onboarded into our company into various departments, and we want to provision an appropriate device for them, provide necessary authorizations, and notify them that they've been granted access based on their department.

Since this is a workshop, each of these steps will be mocked.  But the resulting behavior will mimic real-life event-driven architecture, *including unpredictable lag*.

These services will be used to create a mock workflow in which:
1. A device is provisioned for a new user - this takes place in the Provisioner, and is the start of the Saga
2. The new event is raised which includes the new user's info and the device ID 
3. The Authorizer receives the event, and issues appropriate authorizations based on the user's department
4. An event is then raised to notify the new user of their new authorizations
5. The Notifier receives the event and sends the new user an email
6. An event is raised indicating that the new user has been notified
7. The Provisioner receives the event indicating that the user has been notified and notes the saga as complete for that new user

## Asynchronous Events

To the left, you'll see that there's a toggle for **Trace Mode**, which should be enabled.  While this is on, any data that you send will be tracked across the different consumers, as they receive events in their step in the workflow. The overall architecture of this system looks like this:

<a href="images/s4.1.jpg" class="glightbox">
    <img src="images/s4.1.jpg" alt="Saga Pattern with trace GET requests"/>
</a>

Click the **New User** button a few times to see how data flows asynchronously across the different services.

Note that the different sets of data don't complete in order. This is likely to happen in a production environment, in which multiple producers and consumer groups are handling hundreds or even thousands of data points every second.  The asynchronous steps involved are going to introduce different types of lag that will change the time it takes for each saga to run its course.

## Lack of Visibility

In a production environment, you likely won't be monitoring each and every step of an event-driven architecture.  

To create a more realistic simulation, let's turn **Trace Mode** off.  That will remove visibility into the various steps, and we will *only see the final result once the saga has completed for each new user*.

<a href="images/s4.2.jpg" class="glightbox">
    <img src="images/s4.2.jpg" alt="Saga Pattern with little visibility"/>
</a>

Click the **New User** button a few more times to see the saga pattern at work without being able to trace events as they're passed between services.  It's not exactly comforting, not being able to know what's happening behind the scenes, is it?

