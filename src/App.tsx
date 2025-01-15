import React from 'react';
import AlarmClock from './components/AlarmClock';

function App() {
  return (
    <div className="min-h-screen relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top-right gradient */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/30 to-purple-400/30 rounded-full blur-3xl"></div>
        
        {/* Bottom-left gradient */}
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/30 to-purple-400/30 rounded-full blur-3xl"></div>
        
        {/* Center subtle accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-md bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-full blur-2xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <AlarmClock />
      </div>
    </div>
  );
}

export default App;