#! /bin/bash

docker run -dit -p 3006:80 -v $(pwd):/usr/src/app --restart always --link cwd-mongo:mongo --name cwd-be citywide-dashboard-backend
