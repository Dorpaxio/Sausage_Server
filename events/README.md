# /events

[GET /events](/events/README.md#get-events) - Get events list  
[POST /events](/events/README.md#post-events) - Create new event  
[PATCH /events](/events/README.md#patch-events) - Update an event  


## `Get /events`
Get events
### Example request
``` bash
    curl -H 'Content-Type: application/json' -X GET https://localhost:3000/events/
```

## `POST /events`
Create new event
### Example request
``` bash
    curl -H 'Content-Type: application/json' -X POST -H "Authorization: Bearer $(TOKEN)" -d '{event}'
    https://localhost:3000/events/
```

## `PATCH /events`
Update an event

## `POST /events/subscriptions/`
Subscribe an user to an event
### Example request
``` bash
    curl -X POST -H 'Content-Type: application/x-www-form-urlencoded' -H 'Authorization: Bearer ${TOKEN}' -i http://localhost:3000/events/subscriptions/ --data 'pseudo=TEST&id=${event_id}'
```