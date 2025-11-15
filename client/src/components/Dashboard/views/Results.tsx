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
import ChartFilter from '../../Results/ChartFilter';

type FilterType = 'week' | 'month' | 'all';

const Results: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('week');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const data = await testApi.getUserResults();
        setResults(data);
      } catch (error) {
        addToast("Не удалось загрузить результаты", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
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
    const todayScore = latestTodayResult ? Math.round((latestTodayResult.scores.overall || 0) / 10) : null;

    const totalScore = filteredResults.reduce((sum, r) => sum + (r.scores.overall || 0), 0);
    const averageScore = filteredResults.length > 0 ? Math.round((totalScore / filteredResults.length) / 10) : null;

    const aggregatedByDay = new Map<string, number[]>();
    filteredResults.forEach(r => {
      const day = format(parseISO(r.created_at), 'yyyy-MM-dd');
      if (!aggregatedByDay.has(day)) {
        aggregatedByDay.set(day, []);
      }
      aggregatedByDay.get(day)!.push(Math.round((r.scores.overall || 0) / 20));
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
        <div className={styles.statsGrid}>
          <div className={styles.statBlock}>
            <div className={styles.chartHeader}>
              <h2 className={styles.sectionTitle}>Мое состояние</h2>
              <ChartFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            </div>
            <ResultsChart data={processedData.chartData} />
          </div>

          <div className={styles.statBlock}>
            <h2 className={styles.sectionTitle}>Уровень стресса сегодня</h2>
            <StatCard 
              score={processedData.todayScore}
              maxScore={10} 
              description={<>Уровень стресса сегодня <strong>{processedData.todayScoreDetails.levelText}</strong><br/>{processedData.todayScoreDetails.message}</>}
              color={processedData.todayScoreDetails.color}
            />
          </div>

          <div className={styles.statBlock}>
            <h2 className={styles.sectionTitle}>Средний уровень стресса</h2>
            <StatCard 
              score={processedData.averageScore}
              maxScore={10}
              description={<>Средний показатель сейчас <strong>{processedData.averageScoreDetails.levelText}</strong><br/>{processedData.averageScoreDetails.message}</>}
              color={processedData.averageScoreDetails.color}
            />
          </div>
        </div>

        <h2 className={styles.sectionTitle}>Результаты</h2>
        <ResultsTable results={results} onRowClick={setSelectedResult} />
      </div>

      {selectedResult && (
        <ResultDetailsModal 
          result={selectedResult} 
          onClose={() => setSelectedResult(null)} 
        />
      )}
    </>
  );
};

export default Results;