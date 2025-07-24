import React from 'react';

export default function SettingsPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Settings</h1>
      <p>This is a simple placeholder for the settings page. Customize your settings here.</p>
      <div style={{ marginTop: '20px' }}>
        <div>
          <h2>General Settings</h2>
          <button>Toggle Dark Mode</button>
        </div>
        <div style={{ marginTop: '10px' }}>
          <h2>Notification Settings</h2>
          <button>Configure Notifications</button>
        </div>
      </div>
    </div>
  );
}
