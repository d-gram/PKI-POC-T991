FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Ensure the SSL files are copied correctly
COPY pkidashboard.ddns.net.pem /app/pkidashboard.ddns.net.pem
COPY pkidashboard.ddns.net.key /app/pkidashboard.ddns.net.key

CMD ["gunicorn", "--worker-class", "geventwebsocket.gunicorn.workers.GeventWebSocketWorker", "-w", "1", "-b", "0.0.0.0:443", "--certfile", "/app/pkidashboard.ddns.net.pem", "--keyfile", "/app/pkidashboard.ddns.net.key", "wsgi:app"]