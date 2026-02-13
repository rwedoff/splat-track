import React, { useEffect, useState } from 'react';
import { Stack, PrimaryButton, DefaultButton, Text, DetailsList, IColumn, IconButton, Dialog, DialogFooter, Dropdown, IDropdownOption } from '@fluentui/react';
import { LineChart, ILineChartPoints, ILineChartDataPoint } from '@fluentui/react-charting';
import { Workout } from './types';

export function Home({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<Workout | undefined>(undefined);
  const [confirmVisible, setConfirmVisible] = useState<boolean>(false);
  const [chartData, setChartData] = useState<ILineChartPoints[] | undefined>(undefined);
  const [range, setRange] = useState<string>('30');

  useEffect(() => {
    const req = window.indexedDB.open('splatTrackDB', 1);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('workouts')) {
        db.createObjectStore('workouts', { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = (e) => {
      window.splatDB = (e.target as IDBOpenDBRequest).result;
      const tx = window.splatDB.transaction(['workouts'], 'readonly');
      const store = tx.objectStore('workouts');
      const getAll = store.getAll();
      getAll.onsuccess = () => {
        const results: Workout[] = getAll.result || [];
        console.log('Workouts loaded:', results.length);

        const now = new Date();
        const filteredResults = results.filter(w => {
          if (range === 'all') return true;
          const workoutDate = new Date(w.date);
          const diffDays = (now.getTime() - workoutDate.getTime()) / (1000 * 3600 * 24);
          return diffDays <= parseInt(range);
        });

        // Sort by date descending for list
        const sortedResults = [...filteredResults].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setWorkouts(sortedResults);

        // Prepare chart data (ascending for time series)
        const points: ILineChartDataPoint[] = filteredResults
          .filter(w => w.date && !isNaN(new Date(w.date).getTime())) // Filter out invalid dates
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map(w => {
            const d = new Date(w.date);
            // Shift date so UTC matches Local for the chart labels
            const shiftedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
            return {
              x: shiftedDate,
              y: w.splats || 0,
              xAxisCalloutData: `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              yAxisCalloutData: `${w.splats || 0} Splats (${w.type}, ${w.duration} min)`
            };
          });

        console.log('Chart points prepared:', points.length);

        if (points.length > 0) {
          setChartData([{
            legend: 'Splat Points',
            data: points,
            color: '#ff6600',
          }]);
        } else {
          setChartData([]);
        }

        setLoading(false);
      };
      getAll.onerror = () => {
        setWorkouts([]);
        setLoading(false);
      };
    };
    req.onerror = () => {
      setWorkouts([]);
      setLoading(false);
    };
  }, [range]);

  const columns: IColumn[] = [
    { key: 'date', name: 'Date', fieldName: 'date', minWidth: 120, maxWidth: 180, isResizable: true, onRender: (item: Workout) => new Date(item.date).toLocaleString() },
    { key: 'duration', name: 'Duration (min)', fieldName: 'duration', minWidth: 80, maxWidth: 120, isResizable: true },
    { key: 'type', name: 'Type', fieldName: 'type', minWidth: 80, maxWidth: 120, isResizable: true },
    { key: 'splats', name: 'Splats', fieldName: 'splats', minWidth: 60, maxWidth: 100, isResizable: true },
    {
      key: 'actions', name: '', fieldName: 'actions', minWidth: 48, maxWidth: 64, onRender: (item: Workout) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconButton
            iconProps={{ iconName: 'MoreVertical' }}
            menuProps={{ items: [{ key: 'delete', text: 'Delete', onClick: () => requestDelete(item) }] }}
            ariaLabel="Row actions"
            title="Actions"
            styles={{ root: { width: 44, height: 36, background: 'transparent' }, icon: { color: '#ff6600', fontSize: 16 } }}
          />
        </div>
      )
    },
  ];

  function deleteWorkout(item?: Workout) {
    if (!item || item.id === undefined) return;
    const doRemove = (db: IDBDatabase) => {
      try {
        const tx = db.transaction(['workouts'], 'readwrite');
        const store = tx.objectStore('workouts');
        store.delete(item.id!);
        tx.oncomplete = () => {
          setWorkouts(prev => {
            const newVal = prev.filter(x => x.id !== item.id);

            // Update chart data
            const points: ILineChartDataPoint[] = newVal
              .filter(w => w.date && !isNaN(new Date(w.date).getTime()))
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map(w => {
                const d = new Date(w.date);
                const shiftedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
                return {
                  x: shiftedDate,
                  y: w.splats || 0,
                  xAxisCalloutData: `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                  yAxisCalloutData: `${w.splats || 0} Splats (${w.type}, ${w.duration} min)`
                };
              });

            if (points.length > 0) {
              setChartData([{
                legend: 'Splat Points',
                data: points,
                color: '#ff6600',
              }]);
            } else {
              setChartData([]);
            }

            return newVal;
          });
        };
      } catch (err) {
        console.error('delete error', err);
      }
    };

    if (window.splatDB) {
      doRemove(window.splatDB);
    } else {
      const req = indexedDB.open('splatTrackDB', 1);
      req.onsuccess = (e) => doRemove((e.target as IDBOpenDBRequest).result);
    }

    setSelectedItem(undefined);
  }

  function requestDelete(item?: Workout) {
    // open confirmation dialog
    setSelectedItem(item);
    setConfirmVisible(true);
  }

  function confirmDelete() {
    deleteWorkout(selectedItem);
    setConfirmVisible(false);
  }

  function cancelDelete() {
    setConfirmVisible(false);
    setSelectedItem(undefined);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="splat-header" style={{ width: '100%' }}>Splat Track</div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1rem' }}>
        <div className="splat-container" style={{ width: '100%', maxWidth: 900 }}>
          <Stack tokens={{ childrenGap: 16 }}>
            <Text variant="large" styles={{ root: { textAlign: 'center' } }}>
              Track your workouts by Splat points!
              <br />
              1 Splat = 1 minute with your heart rate at 80%+ of max.
              <br />
              Inspired by Orange Theory.
            </Text>
            <Stack horizontal tokens={{ childrenGap: 12 }} horizontalAlign="center">
              <PrimaryButton onClick={() => onNavigate('enter')}>Enter Workout Data</PrimaryButton>
            </Stack>

            <Dropdown
              label="Time Range"
              selectedKey={range}
              onChange={(_, option) => option && setRange(option.key as string)}
              options={[
                { key: '7', text: 'Last 7 Days' },
                { key: '30', text: 'Last 30 Days' },
                { key: '90', text: 'Last 90 Days' },
                { key: 'all', text: 'All Time' },
              ]}
              styles={{ root: { width: 200, alignSelf: 'flex-start' } }}
            />

            {loading ? (
              <div className="splat-desc">Loading...</div>
            ) : workouts.length === 0 ? (
              <div className="splat-desc">No workout data found.</div>
            ) : (
              <div>
                {chartData && chartData.length > 0 && chartData[0].data.length > 0 && (
                  <div key={`chart-${chartData[0].data.length}-${workouts.length}`} style={{ marginBottom: '2rem', height: '300px' }}>
                    <LineChart
                      data={{ lineChartData: chartData! }}
                      strokeWidth={3}
                      tickFormat="%m/%d"
                    />
                  </div>
                )}

                <DetailsList
                  items={workouts}
                  columns={columns}
                  setKey="set"
                  layoutMode={0}
                  isHeaderVisible={true}
                />

                <Dialog hidden={!confirmVisible} onDismiss={cancelDelete} dialogContentProps={{ title: 'Confirm delete', subText: selectedItem ? `Delete workout on ${new Date(selectedItem.date).toLocaleString()}?` : 'Delete this workout?' }}>
                  <DialogFooter>
                    <PrimaryButton onClick={confirmDelete}>Delete</PrimaryButton>
                    <DefaultButton onClick={cancelDelete}>Cancel</DefaultButton>
                  </DialogFooter>
                </Dialog>
              </div>
            )}
          </Stack>
        </div>
      </div>
    </div>
  );
}
