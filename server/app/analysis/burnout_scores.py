# -*- coding: utf-8 -*-

from typing import Dict, Any, List
import json
import csv
import os

def _to_float_answers(answers: Dict[str, Any]) -> List[float]:
    items = list(answers.items())
    try:
        items_sorted = sorted(items, key=lambda kv: int(kv[0]))
    except Exception:
        items_sorted = items
    out = []
    for k, v in items_sorted:
        try:
            out.append(float(v))
        except Exception:
            s = str(v).strip()
            num = next((int(ch) for ch in s if ch.isdigit()), None)
            if num is None:
                raise ValueError(f"Не удалось распарсить ответ для вопроса {k}: {v}")
            out.append(float(num))
    return out

def _rescale_to_max(values: List[float], target_max: int = 4) -> List[float]:
    orig_max = int(max(values))
    if orig_max == target_max:
        return values.copy()
    return [1 + (v - 1) * ((target_max - 1) / (orig_max - 1)) for v in values]

_OLBI_DISENG_ITEMS = [1, 3, 6, 7, 9, 11, 13, 15]
_OLBI_EXH_ITEMS = [2, 4, 5, 8, 10, 12, 14, 16]
_OLBI_REVERSE = set([1, 3, 5, 6, 7, 10, 11, 12, 13, 14, 15, 16])

def score_olbi(answers: Dict[str, Any]) -> Dict[str, Any]:
    vals = _to_float_answers(answers)
    if len(vals) < 16:
        raise ValueError(f"OLBI ожидает 16 ответов, получено {len(vals)}")
    vals = vals[:16]
    vals4 = _rescale_to_max(vals, target_max=4)
    scores = {}
    for i, v in enumerate(vals4, start=1):
        scores[i] = (5 - v) if i in _OLBI_REVERSE else v
    exh = sum(scores[i] for i in _OLBI_EXH_ITEMS)
    dis = sum(scores[i] for i in _OLBI_DISENG_ITEMS)
    exh_avg, dis_avg = exh / 8, dis / 8
    to_pct = lambda x: round(((x - 1) / 3) * 100, 1)
    return {
        "exhaustion_avg": round(exh_avg, 3),
        "disengagement_avg": round(dis_avg, 3),
        "exhaustion_pct": to_pct(exh_avg),
        "disengagement_pct": to_pct(dis_avg),
        "per_item_scores": scores
    }

def interpret_olbi(scores: Dict[str, Any]) -> Dict[str, Any]:
    def cat(p):
        return "Высокий" if p >= 66 else ("Средний" if p >= 34 else "Низкий")
    return {
        "exhaustion_level": cat(scores['exhaustion_pct']),
        "disengagement_level": cat(scores['disengagement_pct']),
        "notes": "<34% — низкий; 34–66% — умеренный; >66% — высокий риск выгорания."
    }

_CBI_PERSONAL = range(1, 7)
_CBI_WORK = range(7, 14)
_CBI_CLIENT = range(14, 20)

def score_cbi(answers: Dict[str, Any]) -> Dict[str, Any]:
    vals = _to_float_answers(answers)
    if len(vals) < 19:
        raise ValueError(f"CBI ожидает 19 ответов, получено {len(vals)}")
    vals = vals[:19]
    mapping = {1: 0.0, 2: 25.0, 3: 50.0, 4: 75.0, 5: 100.0}
    mapped = {i: mapping[int(round(v))] for i, v in enumerate(vals, start=1)}
    mean = lambda idxs: round(sum(mapped[i] for i in idxs) / len(idxs), 1)
    personal, work, client = mean(_CBI_PERSONAL), mean(_CBI_WORK), mean(_CBI_CLIENT)
    overall = round((personal + work + client) / 3, 1)
    return {"personal": personal, "work_related": work, "client_related": client, "overall": overall}

def interpret_cbi(scores: Dict[str, Any]) -> Dict[str, Any]:
    def cat(v):
        return "Высокий" if v >= 75 else ("Умеренный" if v >= 50 else "Низкий")
    return {
        "personal_level": cat(scores['personal']),
        "work_level": cat(scores['work_related']),
        "client_level": cat(scores['client_related']),
        "overall_level": cat(scores['overall']),
        "note": ">=50 — признак выраженного выгорания."
    }

def append_results_csv(path: str, data: Dict[str, Any]) -> None:
    write_header = not os.path.exists(path)
    with open(path, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        if write_header:
            writer.writerow(list(data.keys()))
        writer.writerow([data[k] for k in data.keys()])

def generate_text_report(test_type: str, scores: Dict[str, Any], interpretation: Dict[str, Any]) -> str:
    if test_type.upper() == 'OLBI':
        return (f"OLBI — Усталость: {scores['exhaustion_pct']}% ({interpretation['exhaustion_level']}), "
                f"Отстранённость: {scores['disengagement_pct']}% ({interpretation['disengagement_level']})")
    elif test_type.upper() == 'CBI':
        return (f"CBI — Personal: {scores['personal']} ({interpretation['personal_level']}), "
                f"Work: {scores['work_related']} ({interpretation['work_level']}), "
                f"Client: {scores['client_related']} ({interpretation['client_level']}), "
                f"Overall: {scores['overall']} ({interpretation['overall_level']})")
    return 'Неизвестный тип теста.'

def analyze_burnout_from_json(path: str) -> Dict[str, Any]:
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    answers = data.get('answers', data)
    test = data.get('test')
    n = len(answers)
    if not test:
        if n == 16:
            test = 'OLBI'
        elif n == 19:
            test = 'CBI'
        else:
            raise ValueError(f"Не удалось определить тип теста: {n} ответов")
    if test.upper() == 'OLBI':
        scores = score_olbi(answers)
        interp = interpret_olbi(scores)
    elif test.upper() == 'CBI':
        scores = score_cbi(answers)
        interp = interpret_cbi(scores)
    else:
        raise ValueError(f"Неизвестный тип теста: {test}")
    report = generate_text_report(test, scores, interp)
    base, _ = os.path.splitext(path)
    report_path = f"{base}_report.txt"
    with open(report_path, 'w', encoding='utf-8') as rf:
        rf.write(report)
    csv_data = {"file": os.path.basename(path), "test": test}
    csv_data.update({k: v for k, v in scores.items() if isinstance(v, (int, float))})
    append_results_csv('burnout_results.csv', csv_data)
    print(f"Отчёт сохранён: {report_path}\nРезультаты добавлены в burnout_results.csv")
    return {"test": test, "scores": scores, "interpretation": interp, "report": report}

if __name__ == '__main__':
    result = analyze_burnout_from_json("olbi_answers.json")
    print("\n--- Итоговый отчёт ---\n" + result['report'])
