from flask import Flask, render_template, jsonify, send_file, request
from flask_socketio import SocketIO, emit
import logging
import json
import csv
import io
from datetime import datetime
import os
import sys

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
socketio = SocketIO(app, ping_timeout=5, ping_interval=1)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

log_entries = []

class SocketIOHandler(logging.Handler):
    def emit(self, record):
        try:
            msg = self.format(record)
            socketio.emit('log_update', {'log': msg})
            log_entries.append(msg)
        except Exception:
            self.handleError(record)

# Create a formatter that matches the format in your terminal
formatter = logging.Formatter('%(asctime)s [%(process)d] [%(levelname)s] %(message)s', datefmt='[%Y-%m-%d %H:%M:%S %z]')

# Create the SocketIOHandler and set its formatter
socketio_handler = SocketIOHandler()
socketio_handler.setFormatter(formatter)

# Add the handler to the root logger to capture all logs
logging.getLogger().addHandler(socketio_handler)

# Capture stdout and stderr
class StreamToLogger:
    def __init__(self, logger, log_level):
        self.logger = logger
        self.log_level = log_level
        self.linebuf = ''

    def write(self, buf):
        for line in buf.rstrip().splitlines():
            self.logger.log(self.log_level, line.rstrip())

    def flush(self):
        pass

sys.stdout = StreamToLogger(logger, logging.INFO)
sys.stderr = StreamToLogger(logger, logging.ERROR)

@socketio.on('connect')
def handle_connect():
    emit('initial_logs', {'logs': log_entries})

@app.route('/')
def index():
    return render_template('index.html', page='Home')

@app.route('/page1')
def page1():
    return render_template('index.html', page='Page 1')

@app.route('/page2')
def page2():
    return render_template('index.html', page='Page 2')

@app.route('/page3')
def page3():
    return render_template('index.html', page='Page 3')

@app.route('/logs')
def get_logs():
    return jsonify(log_entries)

@app.route('/download/<format>')
def download_logs(format):
    if format == 'json':
        return send_file(
            io.BytesIO(json.dumps(log_entries, indent=2).encode()),
            mimetype='application/json',
            as_attachment=True,
            download_name='logs.json'
        )
    elif format == 'csv':
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['log'])
        for entry in log_entries:
            writer.writerow([entry])
        return send_file(
            io.BytesIO(output.getvalue().encode()),
            mimetype='text/csv',
            as_attachment=True,
            download_name='logs.csv'
        )
    elif format == 'txt':
        output = io.StringIO()
        for entry in log_entries:
            output.write(f"{entry}\n")
        return send_file(
            io.BytesIO(output.getvalue().encode()),
            mimetype='text/plain',
            as_attachment=True,
            download_name='logs.txt'
        )
    else:
        return "Invalid format", 400

if __name__ == '__main__':
    cert_path = os.environ.get('CERT_PATH', '/app/pkidashboard.ddns.net.pem')
    key_path = os.environ.get('KEY_PATH', '/app/pkidashboard.ddns.net.key')
    
    print(f"Certificate path: {cert_path}")
    print(f"Key path: {key_path}")
    
    socketio.run(app, host='0.0.0.0', port=443, ssl_context=(cert_path, key_path))
