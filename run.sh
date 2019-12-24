#! /bin/bash

docker run -dit -p 3006:80 -v $(pwd):/usr/src/app --restart always --name cwd-be citywide-dashboard-backend
