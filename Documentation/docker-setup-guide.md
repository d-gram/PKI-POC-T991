# Docker Setup Guide for PKI Project

## 1. Install Docker Desktop

1. Visit the official Docker website: https://www.docker.com/products/docker-desktop
2. Download the appropriate version for your operating system
3. Run the installer and follow the prompts
4. After installation, restart your computer

## 2. Verify Docker Installation

1. Open a terminal or command prompt
2. Run `docker --version` to confirm Docker is installed
3. Run `docker run hello-world` to test Docker functionality

## 3. Create Project Directory

1. Create a new directory for your project: `mkdir pki-project && cd pki-project`
2. Create subdirectories:

   ```
   mkdir flask-app nginx
   ```

## 4. Set Up Flask Application

1. In the `flask-app` directory, create a file named `app.py`:

   ```python
   from flask import Flask

   app = Flask(__name__)

   @app.route('/')
   def hello():
       return "Hello, PKI Project!"

   if __name__ == '__main__':
       app.run(host='0.0.0.0', debug=True)
   ```

2. Create a `requirements.txt` file:
   ```
   Flask==2.0.1
   ```

## 5. Create Dockerfile for Flask App

In the `flask-app` directory, create a file named `Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "app.py"]
```

## 6. Set Up Nginx

1. In the `nginx` directory, create a file named `nginx.conf`:

   ```nginx
   events {
       worker_connections 1000;
   }

   http {
       server {
           listen 80;
           server_name localhost;

           location / {
               proxy_pass http://flask-app:5000;
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
           }
       }
   }
   ```

2. Create a Dockerfile for Nginx in the `nginx` directory:

   ```dockerfile
   FROM nginx:alpine

   COPY nginx.conf /etc/nginx/nginx.conf
   ```

## 7. Create Docker Compose File

In the root project directory, create a file named `docker-compose.yml`:

```yaml
version: '3'

services:
  flask-app:
    build: ./flask-app
    ports:
      - "5000:5000"
    volumes:
      - ./flask-app:/app

  nginx:
    build: ./nginx
    ports:
      - "80:80"
    depends_on:
      - flask-app
```

## 8. Build and Run the Docker Containers

1. In the root project directory, run:

   ```
   docker-compose up --build
   ```

2. Open a web browser and navigate to `http://localhost`
3. You should see the "Hello, PKI Project!" message

## 9. Basic Docker Commands

- Stop the containers: `docker-compose down`
- Start the containers: `docker-compose up -d`
- View logs: `docker-compose logs`
- Rebuild containers: `docker-compose up --build`

## 10. Potential Issues

- Managing persistent data (like certificates) between container restarts
- Properly configuring networking to allow the containers to communicate with each other and the outside world


