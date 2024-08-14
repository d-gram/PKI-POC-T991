# Flask Dashboard Guide for PKI Project

## 1. Set Up Development Environment

1. Create a virtual environment:

   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install required packages:

   ```
   pip install flask flask-wtf python-dateutil pyOpenSSL
   ```

3. Create a `requirements.txt` file:

   ```
   pip freeze > requirements.txt
   ```

## 2. Project Structure

Create the following directory structure:

```
pki_dashboard/
├── app/
│   ├── __init__.py
│   ├── routes.py
│   ├── models.py
│   └── utils.py
├── templates/
│   ├── base.html
│   ├── index.html
│   └── certificate_details.html
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
├── config.py
└── run.py
```

## 3. Basic Flask Application Setup

1. In `app/__init__.py`:

   ```python
   from flask import Flask
   from config import Config

   app = Flask(__name__)
   app.config.from_object(Config)

   from app import routes
   ```

2. In `config.py`:

   ```python
   import os

   class Config:
       SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
   ```

3. In `run.py`:
   ```python
   from app import app

   if __name__ == '__main__':
       app.run(debug=True)
   ```

## 4. Create Routes

In `app/routes.py`:

```python
from flask import render_template, jsonify
from app import app
from app.utils import get_certificate_info

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/certificate/<path:cert_path>')
def certificate_details(cert_path):
    cert_info = get_certificate_info(cert_path)
    return render_template('certificate_details.html', cert_info=cert_info)

@app.route('/api/certificate/<path:cert_path>')
def api_certificate_details(cert_path):
    cert_info = get_certificate_info(cert_path)
    return jsonify(cert_info)
```

## 5. Implement Certificate Parsing

In `app/utils.py`:

```python
from OpenSSL import crypto
from datetime import datetime

def get_certificate_info(cert_path):
    with open(cert_path, 'rb') as cert_file:
        cert_data = cert_file.read()
        cert = crypto.load_certificate(crypto.FILETYPE_PEM, cert_data)

    subject = dict(cert.get_subject().get_components())
    issuer = dict(cert.get_issuer().get_components())

    return {
        'subject': {k.decode(): v.decode() for k, v in subject.items()},
        'issuer': {k.decode(): v.decode() for k, v in issuer.items()},
        'version': cert.get_version(),
        'serial_number': cert.get_serial_number(),
        'not_before': datetime.strptime(cert.get_notBefore().decode(), '%Y%m%d%H%M%SZ'),
        'not_after': datetime.strptime(cert.get_notAfter().decode(), '%Y%m%d%H%M%SZ'),
        'public_key': crypto.dump_publickey(crypto.FILETYPE_PEM, cert.get_pubkey()).decode()
    }
```

## 6. Create HTML Templates

1. In `templates/base.html`:

   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>PKI Dashboard</title>
       <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
   </head>
   <body>
       <header>
           <h1>PKI Dashboard</h1>
       </header>
       <main>
           {% block content %}{% endblock %}
       </main>
       <script src="{{ url_for('static', filename='js/main.js') }}"></script>
   </body>
   </html>
   ```

2. In `templates/index.html`:

   ```html
   {% extends "base.html" %}

   {% block content %}
   <h2>Certificate List</h2>
   <ul id="certificate-list">
       <!-- This will be populated dynamically -->
   </ul>
   {% endblock %}
   ```

3. In `templates/certificate_details.html`:

   ```html
   {% extends "base.html" %}

   {% block content %}
   <h2>Certificate Details</h2>
   <div id="certificate-details">
       <h3>Subject</h3>
       <ul>
       {% for key, value in cert_info.subject.items() %}
           <li>{{ key }}: {{ value }}</li>
       {% endfor %}
       </ul>
       <h3>Issuer</h3>
       <ul>
       {% for key, value in cert_info.issuer.items() %}
           <li>{{ key }}: {{ value }}</li>
       {% endfor %}
       </ul>
       <p>Version: {{ cert_info.version }}</p>
       <p>Serial Number: {{ cert_info.serial_number }}</p>
       <p>Not Before: {{ cert_info.not_before }}</p>
       <p>Not After: {{ cert_info.not_after }}</p>
       <h3>Public Key</h3>
       <pre>{{ cert_info.public_key }}</pre>
   </div>
   {% endblock %}
   ```

## 7. Add Styling

In `static/css/style.css`:

```css
body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    margin: 0;
    padding: 0;
}

header {
    background-color: #333;
    color: #fff;
    text-align: center;
    padding: 1rem;
}

main {
    padding: 2rem;
}

ul {
    list-style-type: none;
    padding: 0;
}

li {
    margin-bottom: 0.5rem;
}

pre {
    background-color: #f4f4f4;
    padding: 1rem;
    overflow-x: auto;
}
```

## 8. Add Client-Side Interactivity

In `static/js/main.js`:

```javascript
document.addEventListener('DOMContentLoaded', function() {
    const certificateList = document.getElementById('certificate-list');
    if (certificateList) {
        // Fetch certificate list from server
        fetch('/api/certificates')
            .then(response => response.json())
            .then(data => {
                data.forEach(cert => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = `/certificate/${cert.path}`;
                    a.textContent = cert.subject.CN || cert.path;
                    li.appendChild(a);
                    certificateList.appendChild(li);
                });
            })
            .catch(error => console.error('Error:', error));
    }

    const certificateDetails = document.getElementById('certificate-details');
    if (certificateDetails) {
        const certPath = window.location.pathname.split('/').pop();
        fetch(`/api/certificate/${certPath}`)
            .then(response => response.json())
            .then(data => {
                // Update certificate details dynamically
                Object.keys(data).forEach(key => {
                    const element = document.getElementById(key);
                    if (element) {
                        if (typeof data[key] === 'object') {
                            element.innerHTML = Object.entries(data[key])
                                .map(([k, v]) => `<li>${k}: ${v}</li>`)
                                .join('');
                        } else {
                            element.textContent = data[key];
                        }
                    }
                });
            })
            .catch(error => console.error('Error:', error));
    }
});
```

To make this work, you'll need to ensure that your Flask backend provides the necessary API endpoints (`/api/certificates` and `/api/certificate/<path:cert_path>`).

## 9. Update Flask Routes

Add these routes to your `app/routes.py`:

```python
import os

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
```

Replace `/path/to/your/certificates` with the actual path where your certificates are stored.

## 10. Testing

1. Start your Flask application:

   ```
   python run.py

   ```
2. Open a web browser and navigate to `http://localhost:5000`
3. You should see a list of certificates. Clicking on a certificate should show its details.

## 11. Next Steps

1. Implement error handling and input validation
2. Add user authentication and authorization
3. Implement certificate revocation checking
4. Add functionality to issue new certificates through the dashboard
5. Implement real-time updates using WebSockets
6. Optimize performance for handling large numbers of certificates

