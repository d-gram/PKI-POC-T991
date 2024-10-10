import os
from flask import render_template, jsonify
from app import app
from app.utils import get_certificate_info
from pathlib import Path

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/certificates')
def api_certificates():
    cert_dir = '/certs'
    certs = set()
    for f in os.listdir(cert_dir):
        if f.endswith(('.crt', '.pem', '.p12')):
            certs.add(f)
    return jsonify([{'path': cert, 'subject': {'CN': cert.split('.')[0]}} for cert in certs])

@app.route('/api/certificate/<path:cert_path>')
def api_certificate_details(cert_path):
    cert_info = get_certificate_info(os.path.join('/certs', cert_path))
    return jsonify(cert_info)
