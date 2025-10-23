import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { FaHome, FaClipboardList, FaChartLine, FaFileAlt } from 'react-icons/fa';
import Home from './Home';
import Tests from './Tests';
import Results from './Results';
import Analytics from './Analytics';

const menuItems = [
  { path: '/student', label: 'Dashboard', icon: FaHome },
  { path: '/student/tests', label: 'Available Tests', icon: FaClipboardList },
  { path: '/student/results', label: 'My Results', icon: FaFileAlt },
  { path: '/student/analytics', label: 'Analytics', icon: FaChartLine }
];

const StudentDashboard = () => {
  return (
    <DashboardLayout menuItems={menuItems}>
      <Routes>
        <Route index element={<Home />} />
        <Route path="tests" element={<Tests />} />
        <Route path="results" element={<Results />} />
        <Route path="analytics" element={<Analytics />} />
      </Routes>
    </DashboardLayout>
  );
};

export default StudentDashboard;
