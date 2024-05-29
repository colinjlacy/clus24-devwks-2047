# Hands-On with Event-Driven Architecture

This is a self-contained workshop that is meant to demonstrate some of the core concepts of event-driven architecture using a message bus (e.g. Kafka) to power data flow.

The project is broken up into three sections:
- the root files, which are used in the lab guide (i.e. `producer.py`, `consumer.py`, `docker-compose.yaml`)
- the lab guide, which is a React project found in `workshop-ui/`
- a utility consumer/producer service, found in `consumer-prducer/`

## Getting Started

Clone this project locally, and 

Running this project is very straightforward.  First, `run the lab guide:
```bash
cd workshop-ui/build
python3 -m http.server 3000 
```

That will start a local server on [http://localhost:3000](http://localhost:3000), where you can view the lab guide.

From there, you can follow the instructions in the UI to complete the workshop.

**NOTE:** You will need to use multiple Terminal windows once you start the lab guide, all meant to be run from the root of this project.
                  
## Public URL

There will be a **temporary** deployment of the lab guide available at [https://i9emd683cm.us-west-2.awsapprunner.com/](https://i9emd683cm.us-west-2.awsapprunner.com/).  You will still need to pull this repo, as the deployment will **only** be for the lab guide.  The Python code and Docker environment are meant to be run locally.  