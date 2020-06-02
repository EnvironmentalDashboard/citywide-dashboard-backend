#! /bin/bash

docker run -dit -p 3006:80 -v $(pwd)/src:/usr/src/app/src -v $(pwd)/migrate:/usr/src/app/migrate --restart always --link cwd-mongo:mongo --name cwd-be citywide-dashboard-backend
