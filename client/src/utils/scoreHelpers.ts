export interface ScoreDetails {
  levelText: string;
  message: string;
  color: string;
}

export const getScoreDetails = (score: number | null): ScoreDetails => {
  if (score === null) {
    return {
      levelText: 'нет данных',
      message: 'Пройдите тест сегодня!',
      color: '#6b7280',
    };
  }

  if (score <= 3) {
    return {
      levelText: 'низкий',
      message: 'Вы в порядке!',
      color: '#00A337',
    };
  } else if (score <= 6) {
    return {
      levelText: 'умеренный',
      message: 'Стоит обратить внимание',
      color: '#F59E0B',
    };
  } else {
    return {
      levelText: 'высокий',
      message: 'Рекомендуется отдых',
      color: '#EF4444',
    };
  }
};