// src/routes/dashboard/chat.tsx atau file lain
import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import CustomerTable from '../../../component/template/CustomerTable'; 

function RouteComponent() {
  return (
    <div>
      <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Customer List</h1>
      <CustomerTable />
    </div>
  );
}

export const Route = createFileRoute('/dashboard/chat/')({
    component: RouteComponent,
});