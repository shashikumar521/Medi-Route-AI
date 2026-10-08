/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { DoctorLoginPage } from './pages/DoctorLoginPage';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';
import { NewRequestPage } from './pages/NewRequestPage';
import { DeliveryTrackingPage } from './pages/DeliveryTrackingPage';
import { MyRequestsPage } from './pages/MyRequestsPage';
import { SimpleRobotStatusPage } from './pages/SimpleRobotStatusPage';
import { SimpleHospitalMapPage } from './pages/SimpleHospitalMapPage';
import { HelpAdminPage } from './pages/HelpAdminPage';
import { SystemArchitecturePage } from './pages/SystemArchitecturePage';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {/* Doctor Login Route (outside AppLayout if desired, or handled standalone) */}
          <Route path="/login" element={<DoctorLoginPage />} />

          {/* Protected Main Doctor Workflow */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DoctorDashboardPage />} />
            <Route path="dashboard" element={<Navigate to="/" replace />} />
            <Route path="new-request" element={<NewRequestPage />} />
            <Route path="tracking" element={<DeliveryTrackingPage />} />
            <Route path="tracking/:orderId" element={<DeliveryTrackingPage />} />
            <Route path="requests" element={<MyRequestsPage />} />
            <Route path="robot" element={<SimpleRobotStatusPage />} />
            <Route path="map" element={<SimpleHospitalMapPage />} />
            <Route path="help" element={<HelpAdminPage />} />
            <Route path="admin" element={<SystemArchitecturePage />} />

            {/* Seamless redirects for legacy paths */}
            <Route path="inventory" element={<Navigate to="/new-request" replace />} />
            <Route path="orders" element={<Navigate to="/requests" replace />} />
            <Route path="planner" element={<Navigate to="/admin" replace />} />
            <Route path="history" element={<Navigate to="/requests" replace />} />
            <Route path="logs" element={<Navigate to="/admin" replace />} />
            <Route path="settings" element={<Navigate to="/admin" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
