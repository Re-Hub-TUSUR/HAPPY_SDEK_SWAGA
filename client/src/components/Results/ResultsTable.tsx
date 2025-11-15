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
              <td>{format(new Date(result.created_at), 'dd.MM.yyyy, HH:mm', { locale: ru })}</td>
              <td>{result.test_title}</td>
              <td>
                <ScoreDots score={Math.round((result.scores.overall || 0) / 20)} max={5} />
              </td>
              <td className={styles.recommendation} title={result.recommendations}>
                {result.recommendations}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;