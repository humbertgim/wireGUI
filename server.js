const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const cors = require('cors'); // Import cors middleware
const app = express();
const PORT = 3001;

// Middleware to parse JSON
app.use(express.json());
app.use(cors());

// Path to WireGuard configuration directory
//const CONFIG_DIR = '/etc/wireguard';
const CONFIG_DIR = 'c:\\projectes';

// Endpoint to list WireGuard configurations
app.get('/list-configs', (req, res) => {
  exec(`dir /b ${CONFIG_DIR}\\*.conf`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ message: 'Error listing configurations', error: stderr });
    }
    const configs = stdout.split('\n').filter(Boolean).map(file => path.basename(file));
    res.json({ configs });
  });
});

// Endpoint to get configuration content
app.get('/get-config/:name', (req, res) => {
  const configName = req.params.name;
  const configPath = path.join(CONFIG_DIR, configName);

  if (!fs.existsSync(configPath)) {
    return res.status(404).json({ message: 'Configuration not found' });
  }

  fs.readFile(configPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading configuration', error: err.message });
    }
    res.json({ content: data });
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
