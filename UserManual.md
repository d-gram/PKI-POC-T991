Setup Guide and User Manual
Team 991 - Proof Of Concept of Public Key Infrastructure

Project Overview
The project shows a proof of concept of implementing secure communication by utilising Public Key Infrastructure. A dashboard will display all of the authenticated certificates, as well as the connections and activities achieved via this communication.

-- Architecture --
1. Flask Application
The dashboard is built on top of Flask and runs inside of the Docker container.

2. EJBCA Integration
Open-source PKI to allow the creation and publication of certificates for trusted connections.


-- Dashboard Components --
The dashboard is made up of two pages, the user login page and the main dashboard page. The main page includes the certificate list and the logs. It is run as a Flask app inside of a docker container at this current stage.

1. Login and Registration
The login screen takes you to the dashboard.

2. Main Dashboard:
- Certificate List
Shows a list of certificates authenticated by a trusted root user.

- Logs
The logs will display the activity on the dashboard such as who has connected and when they connected.

- Docker Container
The docker container is the platform allowing the Flask app dashboard to run in any environment.

- EJBCA
Is an open source PKI software that allows us to create and publish our own certificates to create a trusted connection to the users.	

-- Software Requirements --
The software requirements for this product include:
Python: Version 3.12.0 (https://www.python.org)
Flask: Version 3.0.3
OpenSSL: Version 24.2.1
Werkzeug: Version 3.0.4
Docker (https://www.docker.com)
EJBCA (https://www.ejbca.org)

-- Hardware Requirements --
The Hardware requirements for this product include:
Client Computer: 
Must be connected to the internet

Server: 
Must have Docker installed

-- Setup Instructions --
Github
https://github.com/d-gram/PKI-POC-T991

Server
The server will have to have docker installed and be able to run python 3 for the flask app.
It will need to have EJBCA so that it can issue other certificates to create a trusted network for PKI communication.
The server will need to be connected to the internet so it can host the flask app online and be available for users to connect to it from their own computers.

Computer
The computer will have to be connected to the internet and be able to access the flask app hosted by the server.
