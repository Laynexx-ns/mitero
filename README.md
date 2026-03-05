# Mitero


Mitero is a lightweight file observer that watches filesystem events and performs configurable actions.
The system is designed around a queue-based processing pipeline with worker concurrency.

Plugin support and extended exporter integrations are planned.


## Features

- Concurrent file processing with configurable worker pool
- Multiple watchers with independent configuration
- Batch processing pipeline
- Docker support

___

## Configuration

### Environment variables


Create a `.env` file based on `.env.yandex-example`.

Example:
```env
# Required: Yandex Disk API token
YANDEX_API_TOKEN="your_token"

# Optional: upload subdirectory inside Yandex Disk
YANDEX_UPLOAD_PATH="some_path"

# Required: host directory mounted into Docker
MOUNT_PATH=/Users/user/folder
```

MOUNT_PATH defines the host directory that will be mounted into the container and used as the root for file watching.

### App config

Modify `config.yml`. Remember that `watcher.watchPath` is relative to MOUNT_PATH.

Example:
```yml
workers: 5
batchSize: 2
batchTimeout: 1000

watchers:
  watcher-1:
    listen: "*"
    watchPath: "." # relative to MOUNT_PATH
    processExisting: false
    recursive: true
    tag: test_tag
    exporters:
      - yandex-exporter
    deleteOnProcessEnd: true
```

you can define up to 100 workers and unlimited amount of watchers


## Running the Project

### Using Docker (recommended)

Start the service:
```bash
docker compose -f docker-compose.yml up -d
```
Docker will mount the directory specified by MOUNT_PATH and start the watcher.

### Running locally with Bun

Requirements:
Bun (latest version)


Install dependencies:
```bash
bun install
```
Run the application:
```bash
bun src/bootstrap.ts
```


## Architecture

<img width="1913" height="580" alt="image" src="https://github.com/user-attachments/assets/8c465d20-f9e8-4c4d-b15e-3f7f73986b51" />


___ 


made with love by laynexx
