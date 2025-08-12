import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Signup from './pages/signup'
import ProtectedRoute from './routes/ProtectedRoute'
import AdminRoute from './routes/AdminRoute'
import Dashboard from './pages/dashboard'
// import { LoginForm } from './components/LoginForm'
import Login from './pages/Login'
import TripPlannerOld from './pages/TripPlanner'
import TripPlanner from './pages/TripPlannerNew'
import Community from './pages/Community'
import TripDetailView from './components/TripDetailView'
import UserProfile from './pages/UserProfile'
import PredefinedItineraryDetail from './pages/PredefinedItineraryDetail'
import Unauthorized from './pages/Unauthorized'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>} />
        <Route path="/trip-planner" element={
          <ProtectedRoute>
            <TripPlanner />
          </ProtectedRoute>
        } />
        <Route path="/trip-planner-old" element={
          <ProtectedRoute>
            <TripPlannerOld />
          </ProtectedRoute>
        } />
        <Route path="/community" element={
            <Community />
        } />
        <Route path="/community/trip/:tripId" element={
          
            <TripDetailView />
        } />
        <Route path="/trip/:tripId" element={
          <ProtectedRoute>
            <TripDetailView />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/itinerary-detail" element={
          <ProtectedRoute>
            <PredefinedItineraryDetail />
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <AdminRoute>
              <Analytics />
            </AdminRoute>
          </ProtectedRoute>
        } />
      </Routes>

    </BrowserRouter>
  )
}

export default App