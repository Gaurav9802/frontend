// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout/Layout";
import Clients from "./screen/Clients";
import AddClient from "./components/AddClients.js/AddClient";
import EditClient from "./components/EditClient.js/EditClient";
import ViewProjects from "./components/ViewProjects/ViewProjects";
import AddProject from "./components/AddProjects/AddProject";
import EditProject from "./components/EditProject/EditProject";
import AllDetail from "./components/AllDetails/AllDetail";
import AddInvoice from "./components/AddInvoices/AddInvoice";
import AddExpense from "./components/AddExpenses/AddExpense";
import ViewExpenses from "./components/ViewExpenses/ViewExpenses";
import AddFollowup from "./components/AddFollowup/AddFollowup";
import ViewInvoices from "./components/ViewInvoices/ViewInvoices";
import ViewFollowups from "./components/ViewFollowups/ViewFollowups";
import ClientFollowup from "./components/ClientFollowups/ClientFollowup";
import SendMail from "./components/SendMail/SendMail";
import Dashboard from "./components/Dashboard/Dashboard";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from './screen/LandingPage';
import ContactUs from './screen/ContactUs';
import Login from './screen/Login';
import Signup from './screen/Signup';
import ForgotPassword from './screen/ForgotPassword';
import ResetPassword from './screen/ResetPassword';
import ChangePassword from './screen/ChangePassword';
import AdminManagement from "./components/AdminManagement/AdminManagement";
import SuperAdminDashboard from "./components/SuperAdmin/SuperAdminDashboard";
import ManageAdmins from "./components/SuperAdmin/ManageAdmins";
import SubscriptionPlans from "./components/SuperAdmin/SubscriptionPlans";
import AdminDetailView from "./components/SuperAdmin/AdminDetailView";
import WebsiteSettings from "./components/SuperAdmin/WebsiteSettings";

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Route: Landing Page */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/contact-us" element={<ContactUs />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ChangePassword />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="/admin-management" element={
              <ProtectedRoute requiredRole="superadmin">
                <Layout>
                  <AdminManagement />
                </Layout>
              </ProtectedRoute>
            } />

            {/* SUPER ADMIN ROUTES */}
            <Route path="/super-admin/dashboard" element={
              <ProtectedRoute requiredRole="superadmin">
                <Layout>
                  <SuperAdminDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/super-admin/admins" element={
              <ProtectedRoute requiredRole="superadmin">
                <Layout>
                  <ManageAdmins />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/super-admin/admins/:id" element={
              <ProtectedRoute requiredRole="superadmin">
                <Layout>
                  <AdminDetailView />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/super-admin/plans" element={
              <ProtectedRoute requiredRole="superadmin">
                <Layout>
                  <SubscriptionPlans />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/super-admin/website-settings" element={
              <ProtectedRoute requiredRole="superadmin">
                <Layout>
                  <WebsiteSettings />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Nested Protected Routes under Layout */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* The root of this nested section is now effectively empty or can be removed if all routes are direct */}
              {/* <Route path="" element={<Dashboard />} />  -- Dashboard is now a direct route */}
              {/* <Route path="admins" element={
                <ProtectedRoute requiredRole="superadmin">
                  <AdminManagement />
                </ProtectedRoute>
              } /> -- AdminManagement is now a direct route */}
              <Route path="clients" element={<Clients />} />
              <Route path="add-client" element={<AddClient />} />
              <Route path="/edit-client/:clientId" element={<EditClient />} />
              <Route path="all-details/:clientId" element={<AllDetail />} />
              <Route path="projects" element={<ViewProjects />} />
              <Route path="add-project" element={<AddProject />} />
              <Route path="/edit-project/:projectId" element={<EditProject />} />
              <Route path="invoices" element={<ViewInvoices />} />
              <Route path="add-invoices" element={<AddInvoice />} />
              <Route path="send-invoice-gmail" element={<SendMail />} />
              <Route path="expenses" element={<ViewExpenses />} />
              <Route path="add-expense" element={<AddExpense />} />
              <Route path="followups" element={<ViewFollowups />} />
              <Route path="add-followup" element={<AddFollowup />} />
              <Route
                path="/client-followup/:projectId"
                element={<ClientFollowup />}
              />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </div >
  );
}

export default App;
