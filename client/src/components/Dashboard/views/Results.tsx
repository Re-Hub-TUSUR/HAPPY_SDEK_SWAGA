import React, { useEffect, useState, useMemo } from 'react';
import styles from './Results.module.css';
import { useToast } from '../../../contexts/ToastContext';
import { testApi } from '../../../services/testService';
import { TestResult } from '../../../types';
import EmptyState from '../../EmptyState/EmptyState';
import Loader from '../../Loader/Loader';
import { FiFileText } from 'react-icons/fi';
import { format, subDays, subMonths, parseISO } from 'date-fns';
import { getScoreDetails } from '../../../utils/scoreHelpers';
import StatCard from '../../Results/StatCard';
import ResultsChart from '../../Results/ResultsChart';
import ResultsTable from '../../Results/ResultsTable';
import ResultDetailsModal from '../../Results/ResultDetailsModal';
import RecommendationCard from '../../Results/RecommendationCard';

type FilterType = 'week' | 'month' | 'all';

const Results: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('week');
  const [summary, setSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setIsSummaryLoading(true);
      try {
        const resultsDataPromise = testApi.getUserResults();
        const summaryDataPromise = testApi.getSummaryRecommendation();

        const [resultsData, summaryData] = await Promise.all([resultsDataPromise, summaryDataPromise]);
        
        setResults(resultsData);
        setSummary(summaryData.recommendation);

      } catch (error) {
        addToast("Не удалось загрузить данные", "error");
      } finally {
        setIsLoading(false);
        setIsSummaryLoading(false);
      }
    };
    fetchAllData();
  }, [addToast]);
  
  const processedData = useMemo(() => {
    if (!results || results.length === 0) {
      return {
        todayScore: null,
        averageScore: null,
        todayScoreDetails: getScoreDetails(null),
        averageScoreDetails: getScoreDetails(null),
        chartData: [],
        filteredResults: []
      };
    }

    const now = new Date();
    let startDate: Date;

    if (activeFilter === 'week') {
      startDate = subDays(now, 7);
    } else if (activeFilter === 'month') {
      startDate = subMonths(now, 1);
    } else {
      startDate = new Date(0);
    }

    const filteredResults = results.filter(r => parseISO(r.created_at) >= startDate);

    const todayStr = now.toDateString();
    const latestTodayResult = results.find(r => new Date(r.created_at).toDateString() === todayStr);
    const todayScore = latestTodayResult && latestTodayResult.scores && latestTodayResult.scores.overall !== undefined ? Math.round(latestTodayResult.scores.overall / 10) : null;

    const scoresForAverage = filteredResults.map(r => r.scores.overall).filter(s => s !== undefined) as number[];
    const totalScore = scoresForAverage.reduce((sum, s) => sum + s, 0);
    const averageScore = scoresForAverage.length > 0 ? Math.round((totalScore / scoresForAverage.length) / 10) : null;

    const aggregatedByDay = new Map<string, number[]>();
    filteredResults.forEach(r => {
      const day = format(parseISO(r.created_at), 'yyyy-MM-dd');
      if (!aggregatedByDay.has(day)) {
        aggregatedByDay.set(day, []);
      }
      if (r.scores && r.scores.overall !== undefined) {
         aggregatedByDay.get(day)!.push(Math.round(r.scores.overall / 20));
      }
    });

    const chartData = Array.from(aggregatedByDay.entries())
      .map(([day, scores]) => {
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        return {
          date: format(parseISO(day), 'dd.MM'),
          score: parseFloat(avgScore.toFixed(1)),
        };
      })
      .sort((a, b) => {
          const dateA = new Date(a.date.split('.').reverse().join('-'));
          const dateB = new Date(b.date.split('.').reverse().join('-'));
          return dateA.getTime() - dateB.getTime();
      });

    return {
      todayScore,
      averageScore,
      todayScoreDetails: getScoreDetails(todayScore),
      averageScoreDetails: getScoreDetails(averageScore),
      chartData,
      filteredResults
    };
  }, [results, activeFilter]);


  if (isLoading) {
    return <Loader />;
  }

  if (results.length === 0 && !isLoading) {
    return (
      <EmptyState 
        Icon={FiFileText}
        title="Вы еще не прошли ни одного теста"
        message="Результаты ваших тестов и персональные рекомендации будут отображаться здесь. Самое время начать!"
      />
    );
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.topGrid}>
          <div className={styles.chartBlock}>
            <ResultsChart 
              data={processedData.chartData} 
              activeFilter={activeFilter} 
              onFilterChange={setActiveFilter} 
            />
          </div>

          <div className={styles.recommendationBlock}>
            <h2 className={styles.sectionTitle}>Текущая рекомендация</h2>
            <RecommendationCard 
              recommendation={summary} 
              isLoading={isSummaryLoading}
              onReadMore={() => setShowSummaryModal(true)}
            />
          </div>

          <div className={styles.statBlock}>
            <h2 className={styles.sectionTitle}>Уровень стресса сегодня</h2>
            <StatCard 
              score={processedData.todayScore}
              maxScore={10} 
              description={<>Показатель стресса <strong>{processedData.todayScoreDetails.levelText}</strong><br/>{processedData.todayScoreDetails.message}</>}
              color={processedData.todayScoreDetails.color}
            />
          </div>

          <div className={styles.statBlock}>
            <h2 className={styles.sectionTitle}>Средний уровень стресса</h2>
            <StatCard 
              score={processedData.averageScore}
              maxScore={10}
              description={<>Средний показатель <strong>{processedData.averageScoreDetails.levelText}</strong><br/>{processedData.averageScoreDetails.message}</>}
              color={processedData.averageScoreDetails.color}
            />
          </div>
        </div>

        <div className={styles.resultsBlock}>
          <h2 className={styles.sectionTitle}>Результаты</h2>
          <ResultsTable results={results} onRowClick={setSelectedResult} />
        </div>
      </div>

      {selectedResult && (
        <ResultDetailsModal 
          result={selectedResult} 
          onClose={() => setSelectedResult(null)} 
        />
      )}
      
      {showSummaryModal && (
        <ResultDetailsModal 
          result={{ 
            test_title: 'Текущая рекомендация', 
            recommendations: summary,
            created_at: new Date().toISOString()
          } as TestResult} 
          onClose={() => setShowSummaryModal(false)} 
        />
      )}
    </>
  );
};

export default Results;