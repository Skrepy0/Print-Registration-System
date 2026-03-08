import {state, totalPrintNum} from "../../data/constants.js";
import * as constants from "../../data/constants.js";

export function initChart() {
  const ctx = document.getElementById('statistics-chart').getContext('2d');
  const data = getChartData();

  // 创建垂直渐变（从顶部亮蓝到底部紫色）
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, '#3b82f6');   // 亮蓝
  gradient.addColorStop(0.6, '#8b5cf6'); // 紫色

  state.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label: '印刷总数',
        data: data.totalPages,
        backgroundColor: gradient,
        borderRadius: 8,                 // 圆角柱状
        barPercentage: 0.65,              // 柱宽比例
        categoryPercentage: 0.8,          // 类别间距
        hoverBackgroundColor: '#2563eb'    // 悬停颜色
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { top: 20, bottom: 10 }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: '#e2e8f0',
            drawBorder: false
          },
          ticks: {
            color: '#475569',
            font: { size: 11, family: "'Inter', sans-serif" },
            callback: (value) => value + '张'
          }
        },
        x: {
          grid: { display: false },
          ticks: {
            color: '#334155',
            font: { size: 12, weight: '500', family: "'Inter', sans-serif" }
          }
        }
      },
      plugins: {
        legend: {
          display: false  // 隐藏图例（只有一个数据集）
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#cbd5e1',
          borderColor: '#334155',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 10,
          callbacks: {
            label: (ctx) => `📄 印刷总数: ${ctx.raw} 张`
          }
        }
      },
      animation: {
        duration: 800,
        easing: 'easeInOutQuart'
      }
    }
  });
  constants.totalPrintNum.textContent = String(getTotalPagesAllTime());
}

export function updateChart() {
  if (!state.chart) return;
  const d = getChartData();
  state.chart.data.labels = d.labels;
  state.chart.data.datasets[0].data = d.totalPages;
  state.chart.update();
  constants.totalPrintNum.textContent = String(getTotalPagesAllTime());
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
  return { labels, totalPages: pages };
}

/**
 * 获取历史全部印刷总数（所有记录的 totalPages 总和）
 * @returns {number} 所有记录的总印刷页数
 */
export function getTotalPagesAllTime() {
  if (!state.records || !Array.isArray(state.records)) return 0;
  return state.records.reduce((sum, record) => sum + (record.totalPages || 0), 0);
}