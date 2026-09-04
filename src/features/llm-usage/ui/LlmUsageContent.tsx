import React, { useMemo } from 'react';
import { Card, Group, Header, Cell, Div, Text, Subhead } from '@vkontakte/vkui';
import type { LlmUsageSource, LlmUsageSummary, LlmUsageTotals } from '../model/llm-usage.types.ts';
import { PROVIDER_LABELS, SOURCE_LABELS } from '../model/llm-usage.types.ts';

/** Служебные вызовы показываем одной свёрнутой строкой */
const SERVICE_SOURCES: LlmUsageSource[] = ['inline_router', 'currency_parse'];

interface SourceRow {
  key: string;
  title: string;
  subtitle?: string;
  totals: LlmUsageTotals;
}

function formatNumber(value: number): string {
  return value.toLocaleString('ru-RU');
}

/** 1 запрос, 2 запроса, 5 запросов */
function pluralRequests(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'запрос';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'запроса';
  return 'запросов';
}

function formatTokens(total: LlmUsageTotals): string {
  return `${formatNumber(total.promptTokens + total.completionTokens)} ток.`;
}

const TotalsCard: React.FC<{ title: string; totals: LlmUsageTotals }> = ({ title, totals }) => (
  <Card mode="tint" style={{ padding: 16 }}>
    <Subhead weight="2" style={{ color: 'var(--vkui--color_text_secondary)' }}>
      {title}
    </Subhead>
    <Text weight="2" style={{ fontSize: 24 }}>
      {formatNumber(totals.requests)} {pluralRequests(totals.requests)}
    </Text>
    <Subhead style={{ color: 'var(--vkui--color_text_secondary)', marginTop: 4 }}>
      {formatNumber(totals.promptTokens)} prompt · {formatNumber(totals.completionTokens)}{' '}
      completion токенов
    </Subhead>
  </Card>
);

const LlmUsageContent: React.FC<{ summary: LlmUsageSummary }> = ({ summary }) => {
  const dayBars = useMemo(() => {
    const byDay = new Map(summary.days.map((entry) => [entry.day, entry]));
    const bars: { day: string; requests: number }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setUTCDate(date.getUTCDate() - i);
      const key = date.toISOString().slice(0, 10);
      bars.push({ day: key, requests: byDay.get(key)?.requests ?? 0 });
    }
    return bars;
  }, [summary.days]);

  const maxRequests = useMemo(() => Math.max(...dayBars.map((bar) => bar.requests), 1), [dayBars]);

  const sourceRows = useMemo<SourceRow[]>(() => {
    const rows: SourceRow[] = summary.bySource
      .filter((row) => !SERVICE_SOURCES.includes(row.source))
      .map((row) => ({
        key: `${row.source}:${row.provider}`,
        title: `${SOURCE_LABELS[row.source] ?? row.source} · ${
          PROVIDER_LABELS[row.provider] ?? row.provider
        }`,
        totals: row,
      }));

    const service = summary.bySource.filter((row) => SERVICE_SOURCES.includes(row.source));
    if (service.length > 0) {
      rows.push({
        key: 'service',
        title: 'Служебные вызовы',
        subtitle: 'Inline-роутинг и разбор запросов конвертера',
        totals: service.reduce(
          (acc, row) => ({
            requests: acc.requests + row.requests,
            promptTokens: acc.promptTokens + row.promptTokens,
            completionTokens: acc.completionTokens + row.completionTokens,
          }),
          { requests: 0, promptTokens: 0, completionTokens: 0 },
        ),
      });
    }

    return rows;
  }, [summary.bySource]);

  const isEmpty = summary.month.requests === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <TotalsCard title="Сегодня" totals={summary.today} />
        </div>
        <div style={{ flex: 1 }}>
          <TotalsCard title="Этот месяц" totals={summary.month} />
        </div>
      </div>

      {isEmpty && (
        <Group mode="card">
          <Div>
            <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
              Пока нет запросов к LLM. Напишите боту «грок &lt;вопрос&gt;» или воспользуйтесь
              inline-режимом.
            </Text>
          </Div>
        </Group>
      )}

      {summary.byModel.length > 0 && (
        <Group
          mode="card"
          header={<Header>Модели · этот месяц</Header>}
          description="Сумма prompt и completion токенов"
        >
          {summary.byModel.map((row) => (
            <Cell
              key={`${row.provider}:${row.model}`}
              subtitle={PROVIDER_LABELS[row.provider] ?? row.provider}
              after={
                <Text style={{ color: 'var(--vkui--color_text_secondary)', whiteSpace: 'nowrap' }}>
                  {formatNumber(row.requests)} запр. · {formatTokens(row)}
                </Text>
              }
            >
              <span style={{ fontSize: 13 }}>{row.model}</span>
            </Cell>
          ))}
        </Group>
      )}

      {sourceRows.length > 0 && (
        <Group mode="card" header={<Header>Источники · этот месяц</Header>}>
          {sourceRows.map((row) => (
            <Cell
              key={row.key}
              subtitle={row.subtitle}
              after={
                <Text style={{ color: 'var(--vkui--color_text_secondary)', whiteSpace: 'nowrap' }}>
                  {formatNumber(row.totals.requests)} запр. · {formatTokens(row.totals)}
                </Text>
              }
            >
              {row.title}
            </Cell>
          ))}
        </Group>
      )}

      {!isEmpty && (
        <Group
          mode="card"
          header={<Header>Последние 30 дней</Header>}
          description="Количество запросов по дням (UTC)"
        >
          <Div style={{ paddingTop: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 72 }}>
              {dayBars.map((bar) => (
                <div
                  key={bar.day}
                  title={`${bar.day}: ${bar.requests} ${pluralRequests(bar.requests)}`}
                  style={{
                    flex: 1,
                    height: `${Math.max((bar.requests / maxRequests) * 100, bar.requests > 0 ? 8 : 3)}%`,
                    background:
                      bar.requests > 0
                        ? 'var(--vkui--color_background_accent)'
                        : 'var(--vkui--color_background_secondary)',
                    borderRadius: 2,
                  }}
                />
              ))}
            </div>
          </Div>
        </Group>
      )}
    </div>
  );
};

export { LlmUsageContent };
