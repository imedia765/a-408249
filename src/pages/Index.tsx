import { Routes, Route } from 'react-router-dom';
import DashboardView from '@/components/DashboardView';
import MembersList from '@/components/MembersList';
import CollectorsList from '@/components/CollectorsList';
import { useRoleAccess } from '@/hooks/useRoleAccess';

const Index = () => {
  const { canAccessTab } = useRoleAccess();

  return (
    <div className="container mx-auto px-4 py-8">
      <Routes>
        <Route path="/" element={canAccessTab('dashboard') ? <DashboardView /> : null} />
        <Route path="/members" element={canAccessTab('users') ? <MembersList /> : null} />
        <Route path="/collectors" element={canAccessTab('users') ? <CollectorsList /> : null} />
      </Routes>
    </div>
  );
};

export default Index;