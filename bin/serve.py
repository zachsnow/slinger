#!/usr/bin/env python
"""
A tiny HTTPS server to make development more convenient.
"""

import BaseHTTPServer, SimpleHTTPServer
import ssl

httpd = BaseHTTPServer.HTTPServer(('localhost', 4443), SimpleHTTPServer.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket (httpd.socket, certfile='./localhost.pem', server_side=True)
httpd.serve_forever()