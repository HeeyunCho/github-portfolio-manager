import { spawn } from 'child_process';

const serverProcess = spawn('node', ['dist/index.js'], {
    cwd: 'C:/gemini_project/github-portfolio-manager',
    stdio: ['pipe', 'pipe', 'inherit']
});

let output = '';
serverProcess.stdout.on('data', (data) => {
    output += data.toString();
    try {
        const json = JSON.parse(output);
        console.log('Server Response:', JSON.stringify(json, null, 2));
        serverProcess.kill();
    } catch (e) {
        // Wait for more data
    }
});

const listToolsRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
};

console.log('Sending listTools request...');
serverProcess.stdin.write(JSON.stringify(listToolsRequest) + '\n');

setTimeout(() => {
    console.log('Timeout reached. Output so far:', output);
    serverProcess.kill();
    process.exit(0);
}, 5000);
