import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to Portfolio Tracker
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Track your cryptocurrency portfolio performance across multiple
          wallets and exchanges.
        </p>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Getting Started
          </h2>
          <p className="text-gray-600">
            This is the home page of your portfolio tracking application. You
            can start building your portfolio management features here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
