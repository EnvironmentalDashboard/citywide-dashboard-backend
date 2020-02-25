# citywide-dashboard-backend
An interface for allowing the front-end Citywide Dashboard application to interact with its MongoDB database.

The database volume that is referenced in the code can be established and managed from
[the `db/` subdirectory of the main Citywide Dashboard repository](https://github.com/EnvironmentalDashboard/citywide-dashboard.alpha/tree/master/db).

When running in production, would need to switch the Dockerfile to not start
`nodemon`, among some other things.
