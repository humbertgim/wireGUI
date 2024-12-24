const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Path to WireGuard configuration directory
const CONFIG_DIR = '/etc/wireguard';

// Endpoint to list WireGuard configurations
app.get('/list-configs', (req, res) => {
  exec(`ls ${CONFIG_DIR}/*.conf`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ message: 'Error listing configurations', error: stderr });
    }
    const configs = stdout.split('\n').filter(Boolean).map(file => path.basename(file));
    res.json({ configs });
  });
});

// Endpoint to download a specific WireGuard configuration
app.get('/download-config/:name', (req, res) => {
  const configName = req.params.name;
  const configPath = path.join(CONFIG_DIR, configName);

  if (!fs.existsSync(configPath)) {
    return res.status(404).json({ message: 'Configuration not found' });
  }

  res.download(configPath, configName, err => {
    if (err) {
      res.status(500).json({ message: 'Error downloading file', error: err.message });
    }
  });
});

// Endpoint to create a new WireGuard configuration
app.post('/create-config', (req, res) => {
  const { name, content } = req.body;

  if (!name || !content) {
    return res.status(400).json({ message: 'Name and content are required' });
  }

  const configPath = path.join(CONFIG_DIR, name);

  if (fs.existsSync(configPath)) {
    return res.status(400).json({ message: 'Configuration file already exists' });
  }

  fs.writeFile(configPath, content, err => {
    if (err) {
      return res.status(500).json({ message: 'Error creating configuration', error: err.message });
    }
    res.status(201).json({ message: 'Configuration created successfully' });
  });
});

// Endpoint to delete a WireGuard configuration
app.delete('/delete-config/:name', (req, res) => {
  const configName = req.params.name;
  const configPath = path.join(CONFIG_DIR, configName);

  if (!fs.existsSync(configPath)) {
    return res.status(404).json({ message: 'Configuration not found' });
  }

  fs.unlink(configPath, err => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting configuration', error: err.message });
    }
    res.status(200).json({ message: 'Configuration deleted successfully' });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`WireGuard backend server running on http://localhost:${PORT}`);
});
