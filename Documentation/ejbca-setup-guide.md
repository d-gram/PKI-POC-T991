# EJBCA Setup Guide for PKI Project

## 1. Prerequisites

1. Install Java Development Kit (JDK):
   - Download OpenJDK 11 or later from https://adoptopenjdk.net/
   - Install and set JAVA_HOME environment variable

2. Install a database (e.g., MariaDB):
   ```
   sudo apt update
   sudo apt install mariadb-server
   sudo mysql_secure_installation
   ```

## 2. Download and Install EJBCA

1. Download EJBCA Community edition:

   ```
   wget https://sourceforge.net/projects/ejbca/files/latest/download -O ejbca-ce.zip
   unzip ejbca-ce.zip
   cd ejbca-ce-6.15.2.6 (version number may differ)
   ```

2. Set up the database:

   ```
   sudo mysql -u root -p
   CREATE DATABASE ejbca CHARACTER SET utf8 COLLATE utf8_general_ci;
   GRANT ALL PRIVILEGES ON ejbca.* TO 'ejbca'@'localhost' IDENTIFIED BY 'ejbcapassword';
   FLUSH PRIVILEGES;
   exit
   ```

3. Configure EJBCA:
   - Edit `conf/cesecore.properties`:

     ```
     database.name=mysql
     database.url=jdbc:mysql://localhost:3306/ejbca
     database.driver=org.mariadb.jdbc.Driver
     database.username=ejbca
     database.password=ejbcapassword
     ```

4. Build EJBCA:

   ```
   ant clean deployear
   ```

## 3. Set Up the CA

1. Initialize the CA:

   ```
   ant runinstall
   ```

2. Set the superadmin password when prompted

3. Start EJBCA:

   ```
   ant run
   ```

## 4. Access EJBCA Admin Interface

1. Open a web browser and navigate to:
   `https://localhost:8443/ejbca/adminweb/`

2. Accept the self-signed certificate warning

3. Log in with the superadmin credentials

## 5. Create a Root CA

1. In the admin interface, go to CA Functions > Create New CA
2. Fill in the following details:
   - CA Name: PKIProjectRootCA
   - Validity: 10 years
   - Certificate Profile: ROOTCA
   - Crypto Token: CryptoTokenHardCAToken
3. Click "Create" to generate the Root CA

## 6. Create a Subordinate CA

1. Go to CA Functions > Create New CA
2. Fill in the following details:
   - CA Name: PKIProjectSubCA
   - Validity: 5 years
   - Certificate Profile: SUBCA
   - Crypto Token: CryptoTokenHardCAToken
   - Signed By: PKIProjectRootCA
3. Click "Create" to generate the Subordinate CA

## 7. Create Certificate Profiles

1. Go to Certificate Profiles
2. Create profiles for different certificate types (e.g., TLS Server, Client Authentication)

## 8. Create End Entity Profiles

1. Go to End Entity Profiles
2. Create profiles for different types of certificate requestors

## 9. Issue a Test Certificate

1. Go to RA Functions > Add End Entity
2. Fill in the required information
3. Select the appropriate Certificate Profile and End Entity Profile
4. Click "Add" to create the end entity
5. Go to RA Functions > Create Certificate
6. Select the end entity you just created
7. Generate or upload a Certificate Signing Request (CSR)
8. Issue the certificate

## 10. Configure CRL and OCSP

1. Go to CA Functions > Edit CA
2. Configure CRL settings (e.g., CRL issue interval)
3. Set up OCSP responder if required

## 11. Backup and Security

1. Regularly backup the EJBCA database and configuration
2. Secure access to the EJBCA server
3. Implement proper key management practices

## 12. Integration with Project

1. Export the Root CA and Subordinate CA certificates
2. Provide these certificates to the team for integration with the web server
3. Set up a process for certificate issuance for the project's needs

