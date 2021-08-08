# App Review
---
## Purpose
Ce document regroupe les différents points à approfondir des codes source de la webapp `ws-mqtt-bridge`
---
## What to check
---
### ai-universe.html file
[] l.363 snack -> l.1209 showSnackMessage
[] l.847 addVideoMarker
[] l.871 add3dModel
[] l.894 load3dModel
[] l.1184 socket.io

### secure-server.js file
[] l.52 `sockets[clients[config['ws-to']].clientId].emit(config['ws-event'], message);`
[] l.58 server https SSL
[] l.66 server handler
[] l.76 httpsServer -> l.82 listen 8443
[] l.82 httpServer -> l.87 listen 8442
[] l.91 io -> socket/WebSocket (storeClientInfo, open, close, message, getStoredValue)
[] l.117 send message MQTT or WebSocket
[] l.

### mqtt-config.json file
[] l.2 config broker
[] l.8 config publishers
[] l.30 config subscribers

### machine-repair-demo.html file
[] l.98 iframe-wrapper
[] l.114 openProcedure -> l.320 openProcedure -> l.308 openInIframe
[] l.121 assignBox -> l.335 assignBox -> l.308 openInIframe
[] l.129 snack -> l.342 showSnackMessage
[] l.161 initialize
[] l.114 animate
[] l.241/248/255 markerGroup
[] l.263 update
[] l.292 render (moveDiv)
[] l.300 animate
[] l.308 openInIframe
[] l.358 arMqttClient
[] l.429 connectMqttClient

### video-on-marker.html file
[] l.43 initialize -> l.46 initialize
[] l.44 animate -> l.162 animate
[] l.141 update (video play/pause)
[] l.156 render -> l.168 render

### 3d-on-marker.html file
[] l.43 initialize -> l.46 initialize
[] l.44 animate -> l.171 animate
[] l.157 update (video play/pause)
[] l.167 render -> l.182 render
