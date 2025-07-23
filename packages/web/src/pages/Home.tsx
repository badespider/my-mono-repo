import React from 'react';
import { formatDate, formatCurrency, APP_NAME } from '@org/shared';

const Home: React.FC = () => {
  const currentDate = new Date();
  const samplePrice = 1234.56;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to {APP_NAME}
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Track your cryptocurrency portfolio performance across multiple
          wallets and exchanges.
        </p>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Getting Started
          </h2>
          <p className="text-gray-600 mb-4">
            This is the home page of your portfolio tracking application. You
            can start building your portfolio management features here.
          </p>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Shared Package Demo:
            </h3>
            <div className="text-left space-y-1">
              <p className="text-sm text-gray-600">
                Today's date:{' '}
                <span className="font-medium">{formatDate(currentDate)}</span>
              </p>
              <p className="text-sm text-gray-600">
                Sample price:{' '}
                <span className="font-medium">
                  {formatCurrency(samplePrice)}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
