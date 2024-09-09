document.addEventListener('DOMContentLoaded', function() {
    const certificateList = document.getElementById('certificate-list');
    const modal = document.getElementById('certificate-modal');
    const closeButton = document.querySelector('.close-button');
    const certificateDetails = document.getElementById('certificate-details');

    if (certificateList) {
        // Fetch certificate list from server
        fetch('/api/certificates')
            .then(response => response.json())
            .then(data => {
                data.forEach(cert => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = `#`; // Prevent default link behavior
                    // Remove the .crt extension from the certificate name
                    const certNameWithoutExtension = cert.path.replace(/\.crt$/, ''); // Remove .crt
                    a.textContent = certNameWithoutExtension; // Display the full certificate name without .crt
                    a.onclick = function(event) {
                        event.preventDefault(); // Prevent default link behavior
                        // Fetch and display certificate details in the modal
                        fetch(`/api/certificate/${cert.path}`)
                            .then(response => response.json())
                            .then(details => {
                                certificateDetails.innerHTML = ''; // Clear previous details
                                Object.keys(details).forEach(key => {
                                    const detailItem = document.createElement('div');
                                    detailItem.textContent = `${key}: ${details[key]}`;
                                    certificateDetails.appendChild(detailItem);
                                });
                                modal.style.display = 'block'; // Show the modal
                            })
                            .catch(error => console.error('Error:', error));
                    };
                    li.appendChild(a);
                    certificateList.appendChild(li);
                });
            })
            .catch(error => console.error('Error:', error));
    }

    // Close the modal when the close button is clicked
    closeButton.onclick = function() {
        modal.style.display = 'none';
    };

    // Close the modal when clicking outside of the modal content
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
});