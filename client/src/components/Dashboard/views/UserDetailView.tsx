import React, { useState, useEffect } from 'react';
import { testApi } from '../../../services/testService';
import { TestResult } from '../../../types';
import Loader from '../../Loader/Loader';
import ResultsTable from '../../Results/ResultsTable';
import ResultDetailsModal from '../../Results/ResultDetailsModal';

interface UserDetailViewProps {
  userId: number;
  userName: string;
}

const UserDetailView: React.FC<UserDetailViewProps> = ({ userId, userName }) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const resultsData = await testApi.getResultsByUserId(userId);
        setResults(resultsData);
      } catch (error) {
        console.error("Failed to fetch user results", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      {results.length > 0 ? (
        <ResultsTable results={results} onRowClick={setSelectedResult} />
      ) : (
        <p>У сотрудника {userName} пока нет пройденных тестов.</p>
      )}

      {selectedResult && (
        <ResultDetailsModal 
          result={selectedResult} 
          onClose={() => setSelectedResult(null)} 
        />
      )}
    </>
  );
};

export default UserDetailView;