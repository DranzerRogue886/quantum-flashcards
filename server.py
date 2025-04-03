from http.server import HTTPServer, SimpleHTTPRequestHandler
import mimetypes

class CustomHTTPRequestHandler(SimpleHTTPRequestHandler):
    def guess_type(self, path):
        if path.endswith('.js'):
            return 'application/javascript'
        return super().guess_type(path)

if __name__ == '__main__':
    server_address = ('', 3000)
    httpd = HTTPServer(server_address, CustomHTTPRequestHandler)
    print('Server running on port 3000...')
    httpd.serve_forever()