import { jsx as _jsx } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Home, EnterData, ViewData } from './components';
function App() {
    const [page, setPage] = useState(() => {
        if (window.location.hash === '#enter')
            return 'enter';
        if (window.location.hash === '#view')
            return 'view';
        return 'home';
    });
    React.useEffect(() => {
        function onHashChange() {
            if (window.location.hash === '#enter')
                setPage('enter');
            else if (window.location.hash === '#view')
                setPage('view');
            else
                setPage('home');
        }
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);
    if (page === 'enter')
        return _jsx(EnterData, {});
    if (page === 'view')
        return _jsx(ViewData, {});
    return _jsx(Home, { onNavigate: page => {
            window.location.hash = page === 'enter' ? '#enter' : '#view';
        } });
}
export default App;
