const dns = require('dns');

// Use Cloudflare DNS for this Node process to ensure SRV resolution works
dns.setServers(['1.1.1.1', '1.0.0.1']);

// Start the existing server (keeps original code untouched)
require('./server');
