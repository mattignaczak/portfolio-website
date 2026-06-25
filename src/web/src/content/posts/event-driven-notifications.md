---
title: Decoupling Notifications with DynamoDB Streams
date: 2026-05-12
description: Why I moved push notifications off the API request path and onto a change-data-capture pipeline.
tags: [aws, dynamodb, architecture]
draft: false
---

When an API request has to write to the database **and** fan out a push
notification, you've coupled two things that fail differently. The write is
fast and transactional; the notification is slow and best-effort. Bolting them
together means a flaky notification service can slow — or fail — a request that
otherwise succeeded.

## Change data capture to the rescue

DynamoDB Streams emit an ordered log of every item change. Instead of notifying
inline, the API just writes. A separate Lambda consumes the stream and decides
what to notify:

```ts
export const handler = async (event: DynamoDBStreamEvent) => {
  for (const record of event.Records) {
    if (record.eventName !== 'INSERT') continue;
    const item = unmarshall(record.dynamodb!.NewImage!);
    await enqueueNotification(item);
  }
};
```

The request path no longer knows or cares that notifications exist.

## What this buys you

- **Resilience** — a notification outage can't slow a write.
- **Replayability** — reprocess the stream to recover from bugs.
- **A single source of truth** — the table is the event, not a duplicated message.

> Decoupling isn't about adding queues everywhere. It's about letting each part
> fail on its own terms.
