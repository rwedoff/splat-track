import React, { useState } from 'react';
import { Home, EnterData, AppProviders } from './components';

function App() {
  const [page, setPage] = useState(() => {
    if (window.location.hash === '#enter') return 'enter';
    return 'home';
  });

  React.useEffect(() => {
    function onHashChange() {
      if (window.location.hash === '#enter') setPage('enter');
      else setPage('home');
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  let content;
  if (page === 'enter') content = <EnterData />;
  else content = <Home onNavigate={page => { window.location.hash = page === 'enter' ? '#enter' : ''; }} />;

  return (
    <AppProviders>
      {content}
    </AppProviders>
  );
}

export default App;
