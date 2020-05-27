# citywide-dashboard-backend
An interface for allowing the front-end Citywide Dashboard application to interact with its MongoDB database.

The database volume that is referenced in the code can be established and managed from
[the `db/` subdirectory of the main Citywide Dashboard repository](https://github.com/EnvironmentalDashboard/citywide-dashboard.alpha/tree/master/db).

When running in production, would need to switch the Dockerfile to not start
`nodemon`, among some other things.
It is the hope that this will become automatically managed like other applications
eventually.

## Sending requests

Requests to the API should always be done with the header Content-Type set to
`application/json`.
In limited testing with `application/x-www-form-urlencoded`, ensuring data integrity
became more difficult.

## Testing Requests / Sample Requests

Better documentation is a future goal.
For now, contact @Sammidysam for a Postman set up for testing requests.
These test requests provide an example of how requests should look.
