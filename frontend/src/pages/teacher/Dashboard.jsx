import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { FaHome, FaClipboardList, FaUsers, FaChartBar } from 'react-icons/fa';
import Home from './Home';
import Tests from './Tests';
import Groups from './Groups';
import Reports from './Reports';

const menuItems = [
  { path: '/teacher', label: 'Dashboard', icon: FaHome },
  { path: '/teacher/tests', label: 'Tests', icon: FaClipboardList },
  { path: '/teacher/groups', label: 'Student Groups', icon: FaUsers },
  { path: '/teacher/reports', label: 'Reports', icon: FaChartBar }
];

const TeacherDashboard = () => {
  return (
    <DashboardLayout menuItems={menuItems}>
      <Routes>
        <Route index element={<Home />} />
        <Route path="tests" element={<Tests />} />
        <Route path="groups" element={<Groups />} />
        <Route path="reports" element={<Reports />} />
      </Routes>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
