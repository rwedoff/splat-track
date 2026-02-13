import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
export function Home({ onNavigate }) {
    return (_jsxs("div", { children: [_jsx("div", { className: "splat-header", children: "Splat Workout Tracker" }), _jsxs("div", { className: "splat-container", children: [_jsxs("div", { className: "splat-desc", children: ["Track your workouts by Splat points!", _jsx("br", {}), "1 Splat = 1 minute with your heart rate at 80%+ of max.", _jsx("br", {}), "Inspired by Orange Theory."] }), _jsx("button", { className: "splat-btn", onClick: () => onNavigate('enter'), children: "Enter Workout Data" }), _jsx("button", { className: "splat-btn", onClick: () => onNavigate('view'), children: "View Workout Data" })] })] }));
}
export function EnterData() {
    const [duration, setDuration] = useState('');
    const [type, setType] = useState('');
    const [splats, setSplats] = useState('');
    const [message, setMessage] = useState('');
    useEffect(() => {
        if (!window.splatDB) {
            const request = window.indexedDB.open('splatTrackDB', 1);
            request.onupgradeneeded = function (event) {
                const db = event.target.result;
                db.createObjectStore('workouts', { keyPath: 'id', autoIncrement: true });
            };
            request.onsuccess = function (event) {
                window.splatDB = event.target.result;
            };
        }
    }, []);
    function handleSubmit(e) {
        e.preventDefault();
        if (!duration || !type || !splats) {
            setMessage('Please fill out all fields.');
            return;
        }
        const workout = {
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
                setMessage('Workout saved!');
                setDuration('');
                setType('');
                setSplats('');
            };
            tx.onerror = () => {
                setMessage('Error saving workout.');
            };
        }
        else {
            setMessage('Database not ready. Try again in a moment.');
        }
    }
    return (_jsxs("div", { children: [_jsx("div", { className: "splat-header", children: "Enter Workout Data" }), _jsx("div", { className: "splat-container", children: _jsxs("form", { style: { width: '100%', maxWidth: 400 }, onSubmit: handleSubmit, children: [_jsx("div", { className: "splat-desc", children: "Fill out your workout details below:" }), _jsxs("div", { style: { marginBottom: '1rem' }, children: [_jsx("label", { style: { color: '#ff6600', fontWeight: 'bold' }, children: "Duration (minutes):" }), _jsx("br", {}), _jsx("input", { type: "number", min: "1", className: "splat-btn", style: { background: '#fff', color: '#ff6600', border: '1px solid #ff6600' }, value: duration, onChange: e => setDuration(e.target.value), required: true })] }), _jsxs("div", { style: { marginBottom: '1rem' }, children: [_jsx("label", { style: { color: '#ff6600', fontWeight: 'bold' }, children: "Workout Type:" }), _jsx("br", {}), _jsxs("select", { className: "splat-btn", style: { background: '#fff', color: '#ff6600', border: '1px solid #ff6600' }, value: type, onChange: e => setType(e.target.value), required: true, children: [_jsx("option", { value: "", children: "Select type" }), _jsx("option", { value: "Treadmill", children: "Treadmill" }), _jsx("option", { value: "Row", children: "Row" }), _jsx("option", { value: "Bike", children: "Bike" }), _jsx("option", { value: "Weights", children: "Weights" }), _jsx("option", { value: "Other", children: "Other" })] })] }), _jsxs("div", { style: { marginBottom: '1rem' }, children: [_jsx("label", { style: { color: '#ff6600', fontWeight: 'bold' }, children: "Splats:" }), _jsx("br", {}), _jsx("input", { type: "number", min: "0", className: "splat-btn", style: { background: '#fff', color: '#ff6600', border: '1px solid #ff6600' }, value: splats, onChange: e => setSplats(e.target.value), required: true })] }), _jsx("button", { className: "splat-btn", type: "submit", style: { marginTop: '1rem' }, children: "Save Workout" }), _jsx("button", { className: "splat-btn", type: "button", onClick: () => window.location.hash = '', style: { background: '#fff', color: '#ff6600', border: '1px solid #ff6600', marginTop: '0.5rem' }, children: "Back to Home" }), message && _jsx("div", { style: { color: '#ff6600', marginTop: '1rem' }, children: message })] }) })] }));
}
export function ViewData() {
    return (_jsxs("div", { children: [_jsx("div", { className: "splat-header", children: "View Workout Data" }), _jsxs("div", { className: "splat-container", children: [_jsx("div", { className: "splat-desc", children: "Data view coming soon..." }), _jsx("button", { className: "splat-btn", onClick: () => window.location.hash = '', children: "Back to Home" })] })] }));
}
