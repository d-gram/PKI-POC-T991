# PKI Deployment Project - Handover Documentation

## Executive Summary

This document outlines the proof of concept (PoC) deployment of a Public Key Infrastructure (PKI) solution. The project demonstrates secure certificate management and web application hosting using Docker containers:

1. EJBCA Certificate Authority (based on Keyfactor container setup)
2. Flask web application with Gunicorn WSGI server
3. Interactive HTTPS dashboard for monitoring server connections

The solution implements secure HTTPS connections using self-signed certificates and provides real-time monitoring of system access through a web interface.

## System Architecture

### Components Overview
- **Certificate Authority**: EJBCA Keyfactor container with MariaDB backend
- **Web Application**: Flask application with Gunicorn WSGI server in Docker
- **Domain**: https://pkidashboard.ddns.net/

## Deployment Guide

### 1. Setting Up the Certificate Authority

#### Prerequisites
- Linux/Unix-based system with Docker Engine installed
- Docker Compose installed
- At least 4GB of RAM available
- 10GB of free disk space

#### EJBCA Container Setup

1. Create a new directory for EJBCA:
```bash
mkdir ejbca-docker
cd ejbca-docker
```

2. Create a docker-compose.yml file:
```yaml
version: "3.7"
services:
  ejbca:
    image: keyfactor/ejbca-ce:latest
    container_name: ejbca
    ports:
      - "8080:8080"
      - "8443:8443"
    environment:
      - DATABASE_JDBC_URL=jdbc:mariadb://db:3306/ejbca
      - DATABASE_USER=ejbca
      - DATABASE_PASSWORD=ejbca
      - TLS_SETUP_ENABLED=true
      - CA_KEYSTOREPASS=foo123
    depends_on:
      - db

  db:
    image: mariadb:10.6
    container_name: mariadb
    environment:
      - MYSQL_DATABASE=ejbca
      - MYSQL_USER=ejbca
      - MYSQL_PASSWORD=ejbca
      - MYSQL_ROOT_PASSWORD=root123
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

3. Start the containers:
```bash
docker-compose up -d
```

4. Monitor the startup process:
```bash
docker logs -f ejbca
```
Wait until you see the message "Server startup in [XX] milliseconds"

#### Initial EJBCA Configuration

1. Access the EJBCA admin interface:
   - Open a web browser and navigate to https://localhost:8443/ejbca/adminweb/
   - Accept the self-signed certificate warning
   - Default credentials:
     - Username: superadmin
     - Password: Generated during first startup (find in docker logs)

2. Create a Certificate Authority (CA):
   - Go to CA Functions > Create New CA
   - Fill in the following:
     - CA Name: PKI-Dashboard-CA
     - Validity: 10 years
     - Certificate Profile: ROOTCA
     - Token Type: Soft token
     - Subject DN: CN=PKI-Dashboard-CA,O=Your-Organization,C=Your-Country
   - Click Create

3. Create Certificate Profile:
   - Go to Certificate Profiles
   - Clone the ENDUSER profile
   - Name it "SERVER-CERT"
   - Edit the profile:
     - Set validity to 2 years
     - Enable "Server Authentication" under X509v3 extensions
     - Set Key Usage: Digital Signature, Key Encipherment
     - Set Extended Key Usage: Server Authentication
   - Save the profile

4. Create End Entity Profile:
   - Go to End Entity Profiles
   - Add a new profile named "SERVER-PROFILE"
   - Configure:
     - Available CAs: PKI-Dashboard-CA
     - Available Certificate Profiles: SERVER-CERT
     - Subject DN Attributes: CN, O, C
     - Default values as needed
   - Save the profile

5. Generate Server Certificate:
   - Go to Add End Entity
   - Select:
     - End Entity Profile: SERVER-PROFILE
     - Certificate Profile: SERVER-CERT
     - CA: PKI-Dashboard-CA
   - Fill in:
     - Username: pkidashboard
     - Password: (create strong password)
     - CN: pkidashboard.ddns.net
   - Click Add
   - Go to Create Certificate
   - Enter username and password
   - Generate certificate in PKCS#12 format

### 2. Deploying the Web Application

#### Prerequisites Installation

1. **Docker Engine**
   
   For Ubuntu/Debian-based systems:
   ```bash
   # Remove old versions if present
   sudo apt-get remove docker docker-engine docker.io containerd runc

   # Update package index
   sudo apt-get update

   # Install required packages
   sudo apt-get install \
       ca-certificates \
       curl \
       gnupg \
       lsb-release

   # Add Docker's official GPG key
   sudo mkdir -m 0755 -p /etc/apt/keyrings
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

   # Set up repository
   echo \
     "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
     $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

   # Install Docker Engine
   sudo apt-get update
   sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

   # Add current user to docker group
   sudo usermod -aG docker $USER
   newgrp docker
   ```

   For other operating systems, follow the official Docker documentation: https://docs.docker.com/engine/install/

2. **Docker Compose**
   
   For Ubuntu/Debian-based systems (if not installed with Docker Engine):
   ```bash
   # Download latest stable release
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

   # Apply executable permissions
   sudo chmod +x /usr/local/bin/docker-compose

   # Verify installation
   docker-compose --version
   ```

3. **Git**
   
   For Ubuntu/Debian-based systems:
   ```bash
   sudo apt-get update
   sudo apt-get install git

   # Verify installation
   git --version
   ```

4. **miniupnpc (for UPnP port forwarding)**
   
   For Ubuntu/Debian-based systems:
   ```bash
   sudo apt-get update
   sudo apt-get install miniupnpc

   # Verify installation
   upnpc -h
   ```

5. **Verify Prerequisites**

   Run these commands to ensure everything is installed correctly:
   ```bash
   # Check Docker
   docker --version
   docker-compose --version
   
   # Test Docker functionality
   docker run hello-world
   
   # Check Git
   git --version
   
   # Check UPnP client
   upnpc -l
   ```

#### Deployment Steps

1. Clone the repository:
```bash
git clone https://github.com/d-gram/PKI-POC-T991
cd PKI-POC-T991/flask2.1
```

2. Deploy the containers:
```bash
sudo docker-compose up -d --build
```

3. Set up port forwarding using UPnP:
```bash
# Replace <host_ip> with your machine's local IP address
upnpc -a <host_ip> 443 443 TCP
upnpc -a <host_ip> 80 80 TCP
```

The dashboard will now be accessible via:
- Your host's public IP address
- https://pkidashboard.ddns.net (if DNS is configured)

## Deployment Recommendations

### 1. Unified Container Deployment

The current setup can be optimized by consolidating all containers under a single docker-compose configuration:

```yaml
version: "3.7"
services:
  ejbca:
    # EJBCA service configuration
    [Previous EJBCA configuration]
    networks:
      - pki-network

  db:
    # MariaDB service configuration
    [Previous DB configuration]
    networks:
      - pki-network

  dashboard:
    build: ./flask2.1
    ports:
      - "443:443"
      - "80:80"
    depends_on:
      - ejbca
    networks:
      - pki-network

networks:
  pki-network:
    driver: bridge
```

Benefits:
- Simplified deployment process
- Unified network management
- Easier service discovery
- Consolidated logging and monitoring
- Single point of configuration

### 2. Kubernetes Deployment

The solution can be migrated to Kubernetes for enhanced scalability and management:

#### DigitalOcean Kubernetes Setup

1. Prerequisites:
   - DigitalOcean account
   - doctl CLI installed
   - kubectl configured

2. Deployment Steps:
```bash
# Create Kubernetes cluster
doctl kubernetes cluster create pki-cluster \
  --region nyc1 \
  --size s-2vcpu-4gb \
  --count 3

# Apply Kubernetes configurations
kubectl apply -f k8s/
```

3. Required Kubernetes Resources:
   - Deployments for EJBCA and Dashboard
   - Services for external access
   - Persistent Volume Claims for database
   - Ingress controller for HTTPS
   - Secrets for certificates and credentials

Benefits:
- High availability
- Automatic scaling
- Load balancing
- Simplified updates
- Built-in monitoring
- Disaster recovery

## Risk Assessment

### 1. Certificate Management Risks

#### Vulnerabilities:
- Self-signed certificates may trigger browser warnings
- Manual certificate renewal process
- Private key exposure risks

#### Mitigations:
- Implement automated certificate renewal
- Use Hardware Security Modules (HSM) for key storage
- Implement strict access controls for certificate operations
- Consider using Let's Encrypt for public-facing services

### 2. Network Security Risks

#### Vulnerabilities:
- UPnP port forwarding can be exploited
- Open ports 80/443 increase attack surface
- No rate limiting implemented

#### Mitigations:
- Replace UPnP with proper firewall rules
- Implement WAF (Web Application Firewall)
- Add rate limiting for API endpoints
- Use VPN for administrative access

### 3. Container Security Risks

#### Vulnerabilities:
- Root container execution
- Shared network namespace
- Potential container escape vectors
- Base image vulnerabilities

#### Mitigations:
- Run containers with non-root users
- Implement network policy isolation
- Regular security updates for base images
- Use container scanning tools
- Implement resource limits

### 4. Application Security Risks

#### Vulnerabilities:
- Lack of authentication for dashboard access
- Potential SQL injection in log viewing
- No input validation for some parameters
- Clear text logging of sensitive data

#### Mitigations:
- Implement authentication system
- Use parameterized queries
- Add input validation middleware
- Implement log sanitization
- Add session management

### 5. Operational Risks

#### Vulnerabilities:
- Single point of failure in current setup
- Manual backup processes
- Limited monitoring capabilities
- No automated failover

#### Mitigations:
- Implement high availability setup
- Automate backup procedures
- Add comprehensive monitoring
- Implement automated failover
- Create disaster recovery plan

## Security Best Practices

1. Access Control:
   - Implement RBAC for dashboard access
   - Use principle of least privilege
   - Regular access review

2. Monitoring:
   - Implement centralized logging
   - Set up alerts for suspicious activities
   - Regular security audits

3. Updates:
   - Automated security patches
   - Regular dependency updates
   - Version control for configurations

4. Compliance:
   - Regular security assessments
   - Audit logging
   - Data protection measures
   - Incident response plan
