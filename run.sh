#! /bin/bash

# To use a path prefix: -e PATH_PREFIX=api/legacy/citywide-dashboard
docker run -dit -p 3006:80 -v $(pwd)/src:/usr/src/app/src -v $(pwd)/migrate:/usr/src/app/migrate -v $(pwd)/package.json:/usr/src/app/package.json -v $(pwd)/package-lock.json:/usr/src/app/package-lock.json --restart always --link cwd-mongo:mongo --name cwd-be citywide-dashboard-backend
