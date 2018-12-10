# prism
A proof-of-concept kind of work for an event processing pipeline.

## Concept
Events are read from RabbitMQ, processed, put back into RabbitMQ on a separate queue, and then delivered to Google BigQuery. Using RabbitMQ as a medium for the I/O of our raw and processed data allows us to scale each component independently.

When an individual event is being processed, it's broken down into separate contexts. Each context represents a single business domain (e.g. an entity or domain object), and may contain a single-level hierarchy (called sub-contexts). The data for an individual context (including sub-contexts) is extracted by a specific asynchronous process (called `augment`s), and are put to separate tables on BigQuery.

> *Note:* Included in the repo is a script that generates a given number (default: `100k`) of events and publishes them into a queue named `events-raw` on RabbitMQ.

## Prerequisites
- Node.js
- A service account on Google Cloud that has at least the following roles: `BigQuery Admin`
    - Refer to [Google's own documentation](https://cloud.google.com/docs/authentication/getting-started) on how to setup a service account. Once your account is created, simply download the key as a JSON file and place it somewhere of your choice (refer to [Configuration](#configuration) for configuring its path)

## Configuration
The project uses [node-config](https://github.com/lorenwest/node-config), and exposes the following parameters:

| Config Path | Environment Variable | Description |
|-------------|----------------------|-------------|
| `rabbitmq.url` | `RABBITMQ_URL` | The RabbitMQ URL (default: `amqp://localhost:5672`) |
| `gcloud.keyFilename` | `GCLOUD_KEY_FILENAME` | Path to the key file (default: `~/prism-bigquery.json`) |
| `gcloud.projectId` | `GCLOUD_PROJCT_ID` | The ID of the project that contains the BigQuery dataset *(optional, defaults to the project ID found in the key file)* |
| `gcloud.datasetName` | `GCLOUD_DATASET_NAME` | Name of the dataset to use (no default) |

To override a config parameter, simply pass the corresponding environment variable with the value of your choice, or create a file at `config/local.json` that contains the desired overrides (keep in mind that this file is not checked out to SCM).

## Running
- Data generation script
```bash
# Generate 100k events and publish them to amqp://localhost:5672
$ node scripts/generate.js

# Generatee 42 events and publish them to amqp://localhost:5672
$ node scripts/generate.js 42

# Geenerate 42 events and publish them to amqp://192.168.1.113:5672
$ RABBITMQ_URL=amqp://192.168.1.113:5672 node scripts/generate.js 42
```

- Pipeline
```bash
# Run the pipeline on amqp://localhost:5672
$ node index.js

# Run the pipeline on amqp://192.168.1.113:5672
$ RABBITMQ_URL=amqp://192.168.1.113:5672 node index.js
```

## Examples
Raw event, generated randomly:

```json
{
    "context": "device, content, plugin(playlist)",
    "action": "item_completed",
    "timestamp": "Mon Dec 10 2018 17:34:21 GMT+0300 (+03)",
    "pluginName": "playlist",
    "pluginVersion": "1.3.0",
    "playerId": "foobarasdfadfa",
    "deviceId": 2089,
    "mediaId": 248,
    "contentVersionId": 24,
    "location": {
        "lat": 44.90136660572093,
        "lon": 30.231056478948723
    }
}
```

Same event, augmented augmented:

```json
{
    "contexts": [
        "event",
        "device",
        "content",
        "plugin",
        "plugin_playlist"
    ],
    "event": {
        "timestamp": "Mon Dec 10 2018 17:34:21 GMT+0300 (+03)",
        "action": "item_completed",
        "context": "device, content, plugin(playlist)"
    },
    "device": {
        "deviceId": 2089,
        "shopId": 68937,
        "accountId": 252769,
        "location": {
            "lat": 44.90136660572093,
            "lon": 30.231056478948723
        },
        "shopLocation": {
            "lat": 37.22325714782646,
            "lon": 34.73211970213062
        }
    },
    "content": {
        "contentVersionId": 24,
        "contentId": 360,
        "isPristine": false
    },
    "plugin": {
        "pluginName": "playlist",
        "pluginVersion": "1.3.0"
    },
    "plugin_playlist": {
        "mediaId": 248,
        "playerId": "foobarasdfadfa"
    }
}
```

> *Hint:* Run `node scripts/demo.js` to generate your own random event.

## License
MIT
