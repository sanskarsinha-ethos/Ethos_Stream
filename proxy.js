const net = require('net');
const LOCAL_PORT = 5433;
// IPv6 address resolved from db.klxzihjdnpkogwuqcuau.supabase.co (IPv6-only hostname)
const TARGET_HOST = '2406:da14:311:1500:4ca7:8704:d157:c0fc';
const TARGET_PORT = 5432;

net.createServer((localSocket) => {
    const remoteSocket = new net.Socket();
    remoteSocket.connect(TARGET_PORT, TARGET_HOST, () => {
        localSocket.pipe(remoteSocket);
        remoteSocket.pipe(localSocket);
    });
    remoteSocket.on('error', (err) => console.error('Remote Error:', err.message));
    localSocket.on('error', (err) => console.error('Local Error:', err.message));
}).listen(LOCAL_PORT, '0.0.0.0', () => {
    console.log(`Proxy listening on 0.0.0.0:${LOCAL_PORT}`);
});
