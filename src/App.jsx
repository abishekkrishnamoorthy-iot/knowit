import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateQuiz from './pages/CreateQuiz';
import BrowseQuizzes from './pages/BrowseQuizzes';
import TakeQuiz from './pages/TakeQuiz';
import ShareQuiz from './pages/ShareQuiz';
import Leaderboard from './pages/Leaderboard';
import Analytics from './pages/Analytics';
import Admin from './pages/Admin';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-quiz"
            element={
              <ProtectedRoute>
                <CreateQuiz />
              </ProtectedRoute>
            }
          />

          <Route
            path="/browse-quizzes"
            element={
              <ProtectedRoute>
                <BrowseQuizzes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/quiz/:quizId"
            element={<TakeQuiz />}
          />

          <Route
            path="/quiz/:quizId/share"
            element={
              <ProtectedRoute>
                <ShareQuiz />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
