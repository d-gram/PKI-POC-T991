document.addEventListener('DOMContentLoaded', function() {
    const certificateList = document.getElementById('certificate-list');
    const modal = document.getElementById('certificate-modal');
    const closeButton = document.querySelector('.close-button');
    const certificateDetails = document.getElementById('certificate-details');
    const searchInput = document.getElementById('search-input');
    const downloadButtontxt = document.getElementById('download-log-txt');
    const downloadButtonmd = document.getElementById('download-log-md');

    searchInput.addEventListener('input', filterCertificates);

    if (certificateList) {
        // Fetch certificate list from server
        fetch('/api/certificates')
            .then(response => response.json())
            .then(data => {
                const addedCertificates = new Set();
                data.forEach(cert => {
                    const certName = cert.path.replace(/\.crt$/, '');
                    if (!addedCertificates.has(certName)) {
                        const li = document.createElement('li');
                        const a = document.createElement('a');
                        a.href = `#`;
                        a.textContent = certName;
                        a.onclick = function(event) {
                            event.preventDefault();
                            fetch(`/api/certificate/${cert.path}`)
                                .then(response => response.json())
                                .then(details => {
                                    certificateDetails.innerHTML = '';
                                    Object.keys(details).forEach(key => {
                                        const detailItem = document.createElement('div');
                                        detailItem.textContent = `${key}: ${details[key]}`;
                                        certificateDetails.appendChild(detailItem);
                                    });
                                    modal.style.display = 'block';
                                })
                                .catch(error => console.error('Error:', error));
                        };
                        li.appendChild(a);
                        certificateList.appendChild(li);
                        addedCertificates.add(certName);
                    }
                });
                filterCertificates();
            })
            .catch(error => console.error('Error:', error));
    }

    closeButton.onclick = function() {
        modal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    function filterCertificates() {
        const searchTerm = searchInput.value.toLowerCase();
        const certificateItems = certificateList.getElementsByTagName('li');

        for (let i = 0; i < certificateItems.length; i++) {
            const certificateName = certificateItems[i].textContent.toLowerCase();
            if (certificateName.includes(searchTerm)) {
                certificateItems[i].style.display = 'list-item';
            } else {
                certificateItems[i].style.display = 'none';
            }
        }
    }
    
    const activityLog = document.getElementById('activity-log');

    
    const dummyData = [
        { timestamp: '2024-09-18 00:00:00', message: 'John Doe is connected to Jane Doe.'},
        { timestamp: '2024-09-18 01:00:00', message: 'John Doe is disconnected from Jane Doe.'},
    ];

    dummyData.forEach(activity => {
        const li = document.createElement('li');
        li.textContent = `${activity.timestamp}: ${activity.message}`;
        activityLog.appendChild(li);
    });
    

    fetch('/api/activity-log')
        .then(response => response.json())
        .then(data => {
            data.forEach(activity => {
                const li = document.createElement('li');
                li.textContent = `${activity.timestamp}: ${activity.message}`;
                activityLog.appendChild(li);
            });
        })
        .catch(error => console.error('Error fetching activity log:', error));

    downloadButtontxt.onclick = function() {
        const logContent = dummyData.map(activity => `${activity.timestamp}: ${activity.message}`).join('\n');
        const blob = new Blob([logContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'activity_log.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    downloadButtonmd.onclick = function() {
        const logContent = dummyData.map(activity => `${activity.timestamp}: ${activity.message}`).join('\n');
        const blob = new Blob([logContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'activity_log.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
});