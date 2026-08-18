import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MyListView } from '../components/MyListView';

export const MyListPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <MyListView onExplore={() => navigate('/')} />
    </div>
  );
};
