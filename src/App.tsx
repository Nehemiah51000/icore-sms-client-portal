import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ClientShell } from './layout/ClientShell/ClientShell';
import { ProtectedRoute } from './routes/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route
          path='/'
          element={
            <ClientShell title='Home'>
              <HomePage />
            </ClientShell>
          }
        />
        <Route
          path='/history'
          element={
            <ClientShell title='History'>
              <HistoryPage />
            </ClientShell>
          }
        />
        <Route
          path='/settings'
          element={
            <ClientShell title='Settings'>
              <SettingsPage />
            </ClientShell>
          }
        />
      </Route>
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
