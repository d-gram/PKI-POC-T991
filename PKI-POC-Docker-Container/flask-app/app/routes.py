import os
from flask import render_template, jsonify
from app import app
from app.utils import get_certificate_info
from pathlib import Path

@app.route('/')
def index():
    return render_template('test.html')

@app.route('/certificate/<path:cert_path>')
def certificate_details(cert_path):
    cert_info = get_certificate_info(cert_path)
    return render_template('certificate_details.html', cert_info=cert_info)

@app.route('/api/certificates')
def api_certificates():
    # This is a placeholder. In a real application, you'd fetch this from your CA.
    cert_dir = '/path/to/your/certificates'
    certs = [f for f in os.listdir(cert_dir) if f.endswith('.crt')]
    return jsonify([{'path': cert, 'subject': {'CN': cert.split('.')[0]}} for cert in certs])

@app.route('/api/certificate/<path:cert_path>')
def api_certificate_details(cert_path):
    cert_info = get_certificate_info(os.path.join('/path/to/your/certificates', cert_path))
    return jsonify(cert_info)