import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  FaHome,
  FaUsers,
  FaBook,
  FaClipboardList,
  FaUserGraduate,
  FaChalkboardTeacher
} from 'react-icons/fa';
import Home from './Home';
import Teachers from './Teachers';
import Students from './Students';
import Classes from './Classes';
import Subjects from './Subjects';
import Requests from './Requests';

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: FaHome },
  { path: '/admin/teachers', label: 'Teachers', icon: FaChalkboardTeacher },
  { path: '/admin/students', label: 'Students', icon: FaUserGraduate },
  { path: '/admin/classes', label: 'Classes', icon: FaBook },
  { path: '/admin/subjects', label: 'Subjects', icon: FaClipboardList },
  { path: '/admin/requests', label: 'Requests', icon: FaUsers }
];

const AdminDashboard = () => {
  return (
    <DashboardLayout menuItems={menuItems}>
      <Routes>
        <Route index element={<Home />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="students" element={<Students />} />
        <Route path="classes" element={<Classes />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="requests" element={<Requests />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard;
