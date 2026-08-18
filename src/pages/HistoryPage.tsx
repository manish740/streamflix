import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HistoryView } from '../components/HistoryView';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <HistoryView onExplore={() => navigate('/')} />
    </div>
  );
};
