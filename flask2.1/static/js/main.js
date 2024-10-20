const socket = io();
const logContainer = document.getElementById('log-container');
const connectionCount = document.getElementById('connection-count');
const connectionCountTop = document.getElementById('connection-count-top');

socket.on('log_update', function(data) {
    const logEntry = document.createElement('p');
    logEntry.textContent = data.log;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
});

socket.on('update_active_connections', function(data) {
    connectionCount.textContent = data.count;
    connectionCountTop.textContent = data.count;
});

function downloadLogs(format) {
    window.location.href = `/download/${format}`;
}