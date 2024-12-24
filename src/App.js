import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import { Delete as DeleteIcon, Download as DownloadIcon } from '@mui/icons-material';

const API_BASE_URL = 'http://localhost:3000';

function App() {
  const [configs, setConfigs] = useState([]);
  const [newConfigName, setNewConfigName] = useState('');
  const [newConfigContent, setNewConfigContent] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch the list of configurations
  const fetchConfigs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/list-configs`);
      setConfigs(response.data.configs);
    } catch (err) {
      showSnackbar('Error fetching configurations', 'error');
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  // Show snackbar
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  // Download a configuration
  const downloadConfig = async (name) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/download-config/${name}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', name);
      document.body.appendChild(link);
      link.click();
      showSnackbar('Configuration downloaded', 'success');
    } catch (err) {
      showSnackbar('Error downloading configuration', 'error');
    }
  };

  // Create a new configuration
  const createConfig = async () => {
    try {
      if (!newConfigName || !newConfigContent) {
        showSnackbar('Name and content are required', 'warning');
        return;
      }
      await axios.post(`${API_BASE_URL}/create-config`, {
        name: newConfigName,
        content: newConfigContent,
      });
      setNewConfigName('');
      setNewConfigContent('');
      fetchConfigs();
      showSnackbar('Configuration created successfully', 'success');
    } catch (err) {
      showSnackbar('Error creating configuration', 'error');
    }
  };

  // Delete a configuration
  const deleteConfig = async (name) => {
    try {
      await axios.delete(`${API_BASE_URL}/delete-config/${name}`);
      fetchConfigs();
      showSnackbar('Configuration deleted', 'success');
    } catch (err) {
      showSnackbar('Error deleting configuration', 'error');
    }
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '20px' }}>
      <Typography variant="h4" align="center" gutterBottom>
        WireGuard Configuration Manager
      </Typography>

      <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
        <Typography variant="h6" gutterBottom>
          Available Configurations
        </Typography>
        <List>
          {configs.map((config) => (
            <ListItem key={config} divider>
              <ListItemText primary={config} />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => downloadConfig(config)}>
                  <DownloadIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => deleteConfig(config)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper elevation={3} style={{ padding: '20px' }}>
        <Typography variant="h6" gutterBottom>
          Create New Configuration
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Configuration Name"
              fullWidth
              value={newConfigName}
              onChange={(e) => setNewConfigName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Configuration Content"
              multiline
              rows={8}
              fullWidth
              value={newConfigContent}
              onChange={(e) => setNewConfigContent(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={createConfig}>
              Create Configuration
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
