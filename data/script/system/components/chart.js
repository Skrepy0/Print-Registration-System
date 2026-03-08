import {state} from "../../data/constants.js";
export function initChart() {
  const ctx = document.getElementById('statistics-chart').getContext('2d');
  const data = getChartData();
  state.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [
        {label: '印刷总数', data: data.totalPages, backgroundColor: 'rgba(22,93,255,0.7)', borderRadius: 6}
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {y: {beginAtZero: true, grid: {color: '#eef2f6'}}},
      plugins: {legend: {labels: {usePointStyle: true, boxWidth: 8}}}
    }
  });
}

export function updateChart() {
  if (!state.chart) return;
  const d = getChartData();
  state.chart.data.labels = d.labels;
  state.chart.data.datasets[0].data = d.totalPages;
  state.chart.update();
}

export function getChartData() {
  const labels = [], pages = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    labels.push(`${d.getMonth() + 1}月${d.getDate()}日`);
    const day = state.records.filter(r => r.date === key);
    pages.push(day.reduce((s, r) => s + r.totalPages, 0));
  }
  return {labels, totalPages: pages};
}