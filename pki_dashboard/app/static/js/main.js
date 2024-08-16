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