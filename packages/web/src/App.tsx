import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import RunListPage from './pages/RunListPage.tsx';
import RunDetailPage from './pages/RunDetailPage.tsx';
import CreateRunPage from './pages/CreateRunPage.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<RunListPage />} />
          <Route path="runs/new" element={<CreateRunPage />} />
          <Route path="runs/:run_id" element={<RunDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
