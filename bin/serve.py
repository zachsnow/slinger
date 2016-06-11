#!/usr/bin/env python
"""
A tiny HTTPS server to make development more convenient.
"""

import BaseHTTPServer, SimpleHTTPServer
import ssl
import os.path

CERTIFICATE = os.path.join(os.path.dirname(__file__), 'localhost.pem')

httpd = BaseHTTPServer.HTTPServer(('localhost', 4443), SimpleHTTPServer.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket (httpd.socket, certfile=CERTIFICATE, server_side=True)

print "serving at https://localhost:4443/"
httpd.serve_forever()
