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