import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PublishForm from './components/PublishForm';
import Overview from './components/Overview';
import Login from './components/Login';
import { ViewState } from './types';
import { isAuthenticated, logout } from './services/auth';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<ViewState>('overview'); // Default to overview after login
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    // Check authentication on initial load
    const authStatus = isAuthenticated();
    setIsLoggedIn(authStatus);
    setIsAuthChecking(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentView('overview');
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
  };

  // Prevent flash of login screen while checking local storage
  if (isAuthChecking) {
    return null; 
  }

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-slate-800 font-sans selection:bg-purple-200 selection:text-purple-900">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="md:ml-64 min-h-screen p-6 md:p-12 lg:p-16 transition-all duration-300">
        <div className="max-w-5xl mx-auto pt-4 md:pt-8">
          {currentView === 'overview' ? (
            <Overview onNavigateToPublish={() => setCurrentView('publish')} />
          ) : (
            <PublishForm />
          )}
        </div>
        
        {/* Footer / Copyright */}
        <footer className="mt-20 text-center text-slate-400 text-sm font-medium">
          <p>&copy; {new Date().getFullYear()} Prospera Pages. Todos os direitos reservados.</p>
        </footer>
      </main>
      
    </div>
  );
};

export default App;