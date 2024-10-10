from OpenSSL import crypto
from datetime import datetime

def get_certificate_info(cert_path):
    with open(cert_path, 'rb') as cert_file:
        cert_data = cert_file.read()
        cert = crypto.load_certificate(crypto.FILETYPE_PEM, cert_data)
        
    subject_components = cert.get_subject().get_components()
    issuer_components = cert.get_issuer().get_components()

    subject = ', '.join([f"{k.decode()}: {v.decode()}" for k, v in subject_components])
    issuer = ', '.join([f"{k.decode()}: {v.decode()}" for k, v in issuer_components])

    return {
        'Subject': subject,
        'Issuer': issuer,
        'Version': cert.get_version(),
        'Serial number': hex(cert.get_serial_number())[2:].upper(),
        'Valid From': datetime.strptime(cert.get_notBefore().decode(), '%Y%m%d%H%M%SZ'),
        'Valid to': datetime.strptime(cert.get_notAfter().decode(), '%Y%m%d%H%M%SZ'),
        'Public key': crypto.dump_publickey(crypto.FILETYPE_PEM, cert.get_pubkey()).decode()
    }
