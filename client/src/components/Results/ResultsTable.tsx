import React from 'react';
import styles from './ResultsTable.module.css';
import { TestResult } from '../../types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ResultsTableProps {
  results: TestResult[];
  onRowClick: (result: TestResult) => void;
}

const ScoreDots: React.FC<{ score: number, max: number }> = ({ score, max }) => {
  return (
    <div className={styles.scoreDots}>
      <span>{score}/{max}</span>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`${styles.dot} ${i < score ? styles.filled : ''}`}></div>
      ))}
    </div>
  );
};

const ResultsTable: React.FC<ResultsTableProps> = ({ results, onRowClick }) => {
  const getDisplayScore = (result: TestResult): number => {
    if (result.scores && result.scores.overall !== undefined) {
      return Math.round(result.scores.overall / 20);
    }
    if (result.scores && result.scores.exhaustion_pct !== undefined && result.scores.disengagement_pct !== undefined) {
      const avgPct = (result.scores.exhaustion_pct + result.scores.disengagement_pct) / 2;
      return Math.round(avgPct / 20);
    }
    return 0;
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Название</th>
            <th>Итоговый результат</th>
            <th>Рекомендации</th>
          </tr>
        </thead>
        <tbody>
          {results.map(result => (
            <tr 
              key={result.id} 
              className={styles.clickableRow} 
              onClick={() => onRowClick(result)}
            >
              <td data-label="Дата">{format(new Date(result.created_at), 'dd.MM.yyyy, HH:mm', { locale: ru })}</td>
              <td data-label="Название">{result.test_title}</td>
              <td data-label="Итоговый результат">
                <ScoreDots score={getDisplayScore(result)} max={5} />
              </td>
              <td data-label="Рекомендации" className={styles.recommendationCell}>Просмотреть</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;