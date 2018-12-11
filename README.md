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
    "id": "067f75a3-a443-42e3-a1d9-5e520cf3c68b",
    "context": "device, content, plugin(playlist)",
    "action": "item_completed",
    "timestamp": 1544528283159,
    "pluginName": "playlist",
    "pluginVersion": "1.3.0",
    "playerId": "foobarasdfadfa",
    "deviceId": 3482,
    "mediaId": 288,
    "contentVersionId": 37,
    "location": {
        "lat": 44.282856916680274,
        "lon": 26.263955497238666
    }
}
```

Same event, augmented augmented:

```json
{
    "event": {
        "id": "067f75a3-a443-42e3-a1d9-5e520cf3c68b",
        "timestamp": "2018-12-11T14:38:03+03:00",
        "action": "item_completed",
        "contexts": [
            "event",
            "device",
            "content",
            "plugin",
            "plugin_playlist"
        ]
    },
    "device": {
        "eventId": "067f75a3-a443-42e3-a1d9-5e520cf3c68b",
        "deviceId": 3482,
        "shopId": 114906,
        "accountId": 421322,
        "deviceLocation": {
            "type": "Point",
            "coordinates": [
                26.263955497238666,
                44.282856916680274
            ]
        },
        "shopLocation": {
            "type": "Point",
            "coordinates": [
                32.92814099272044,
                43.84156492181714
            ]
        }
    },
    "content": {
        "eventId": "067f75a3-a443-42e3-a1d9-5e520cf3c68b",
        "contentVersionId": 37,
        "contentId": 555,
        "isPristine": true
    },
    "plugin": {
        "eventId": "067f75a3-a443-42e3-a1d9-5e520cf3c68b",
        "pluginName": "playlist",
        "pluginVersion": "1.3.0"
    },
    "plugin_playlist": {
        "eventId": "067f75a3-a443-42e3-a1d9-5e520cf3c68b",
        "mediaId": 288,
        "playerId": "foobarasdfadfa"
    }
}
```

> *Hint:* Run `node scripts/demo.js` to generate your own random event.

## License
MIT
