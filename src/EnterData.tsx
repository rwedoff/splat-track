import React, { useState, useEffect } from 'react';
import { Workout } from "./types";
import { TextField, PrimaryButton, DefaultButton, Dropdown, IDropdownOption, Stack } from '@fluentui/react';

declare global {
  interface Window {
    splatDB?: IDBDatabase;
  }
}

export function EnterData() {
  const [duration, setDuration] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [splats, setSplats] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (!window.splatDB) {
      const request = window.indexedDB.open('splatTrackDB', 1);
      request.onupgradeneeded = function (event) {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore('workouts', { keyPath: 'id', autoIncrement: true });
      };
      request.onsuccess = function (event) {
        window.splatDB = (event.target as IDBOpenDBRequest).result;
      };
    }
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!duration || !type || !splats) {
      setMessage('Please fill out all fields.');
      return;
    }
    const workout: Workout = {
      duration: Number(duration),
      type,
      splats: Number(splats),
      date: new Date().toISOString()
    };
    if (window.splatDB) {
      const tx = window.splatDB.transaction(['workouts'], 'readwrite');
      const store = tx.objectStore('workouts');
      store.add(workout);
      tx.oncomplete = () => {
        window.location.hash = '';
      };
      tx.onerror = () => {
        setMessage('Error saving workout.');
      };
    } else {
      setMessage('Database not ready. Try again in a moment.');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="splat-header" style={{ width: '100%' }}>Enter Workout Data</div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1rem' }}>
        <div className="splat-container">
          <form style={{ width: '100%', maxWidth: 400 }} onSubmit={handleSubmit}>
            <Stack tokens={{ childrenGap: 12 }}>
              <TextField
                label="Duration (minutes)"
                type="number"
                min={1}
                value={duration}
                onChange={(e, newVal) => setDuration(newVal || '')}
                required
              />
              <Dropdown
                label="Workout Type"
                placeholder="Select type"
                selectedKey={type || undefined}
                onChange={(e, option) => setType((option?.key as string) || '')}
                options={[
                  { key: 'Treadmill', text: 'Treadmill' },
                  { key: 'Row', text: 'Row' },
                  { key: 'Bike', text: 'Bike' },
                  { key: 'Weights', text: 'Weights' },
                  { key: 'Yoga', text: 'Yoga' },
                  { key: 'Dance', text: 'Dance' },
                  { key: 'Scooter', text: 'Scooter' },
                  { key: 'Racquet Ball', text: 'Racquet Ball' },
                  { key: 'Scuba', text: 'Scuba' },
                  { key: 'Bootcamp', text: 'Bootcamp' },
                  { key: 'Other', text: 'Other' }
                ]}
              />
              <TextField
                label="Splats"
                type="number"
                min={0}
                value={splats}
                onChange={(e, newVal) => setSplats(newVal || '')}
                required
              />
              <Stack horizontal tokens={{ childrenGap: 8 }}>
                <PrimaryButton type="submit">Save Workout</PrimaryButton>
                <DefaultButton onClick={() => window.location.hash = ''}>Back to Home</DefaultButton>
              </Stack>
              {message && <div style={{ color: '#ff6600', marginTop: '1rem' }}>{message}</div>}
            </Stack>
          </form>
        </div>
      </div>
    </div>
  );
}
