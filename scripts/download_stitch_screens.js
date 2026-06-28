const fs = require('fs');
const https = require('https');
const path = require('path');

const screens = [
    {
        name: 'admin-login',
        url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2I3ZWI2NzcyMzM1YjQ0ZGY4NzM2ZTM2M2M5ODRkZjYyEgsSBxCugtLm9AkYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjI0ODE4MjQ5MjYzNjk0MTI0MQ&filename=&opi=96797242'
    },
    {
        name: 'admin-dashboard',
        url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzBhZjBlMjQ5YWMzYTQwZDNhM2Q2MTJjZWQzYzE5MTYwEgsSBxCugtLm9AkYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjI0ODE4MjQ5MjYzNjk0MTI0MQ&filename=&opi=96797242'
    },
    {
        name: 'article-editor',
        url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzA5ODY5NmRkYjFlZDQ5ZjQ4ZmI0OGRhNWU4NjVmMTA0EgsSBxCugtLm9AkYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjI0ODE4MjQ5MjYzNjk0MTI0MQ&filename=&opi=96797242'
    },
    {
        name: 'compliance-calendar-manager',
        url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2IzOTYzZGM1MDI1NTQyMzdiMDI5ODFlMDE2ODJiOWU2EgsSBxCugtLm9AkYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjI0ODE4MjQ5MjYzNjk0MTI0MQ&filename=&opi=96797242'
    },
    {
        name: 'newsletter-composer',
        url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzViZWU0ODU3YjRjZjQ4ZTlhZDlmM2E2NTE2MmE4YThhEgsSBxCugtLm9AkYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjI0ODE4MjQ5MjYzNjk0MTI0MQ&filename=&opi=96797242'
    },
    {
        name: 'rule-engine-configurator',
        url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2ZhMzIzODk2NGNlYjQyYWU4NTYxZDhhODZjZjBkNzk4EgsSBxCugtLm9AkYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjI0ODE4MjQ5MjYzNjk0MTI0MQ&filename=&opi=96797242'
    }
];

const destDir = path.join(__dirname, '..', '.stitch', 'designs');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

function download(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: status code ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

async function main() {
    console.log('Downloading designs to:', destDir);
    for (const screen of screens) {
        const destPath = path.join(destDir, `${screen.name}.html`);
        console.log(`Downloading ${screen.name}...`);
        try {
            await download(screen.url, destPath);
            console.log(`✅ Saved ${screen.name} to ${destPath}`);
        } catch (err) {
            console.error(`❌ Failed to download ${screen.name}:`, err.message);
        }
    }
    console.log('Done!');
}

main();
