function drawCharts() {
  const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
  const textColor = isDark ? '#e8e8e8' : '#212529';
  const gridColor = isDark ? '#333355' : '#dee2e6';
  const accentColor = isDark ? '#6ea8fe' : '#212529';
  const accentBg = isDark ? 'rgba(110, 168, 254, 0.15)' : 'rgba(33, 37, 41, 0.1)';

  const sharedOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: textColor } },
      title: { display: true, color: textColor }
    },
    scales: {
      x: { ticks: { color: textColor }, grid: { color: gridColor } },
      y: { ticks: { color: textColor }, grid: { color: gridColor } }
    }
  };

  const has = id => document.getElementById(id);

  ['popularServicesChart', 'ratingsChart', 'serviceBreakdownChart'].forEach(id => {
    const canvas = document.getElementById(id);
    if (canvas) {
      const existing = Chart.getChart(canvas);
      if (existing) existing.destroy();
    }
  });

  if (has('popularServicesChart')) {
    new Chart(has('popularServicesChart'), {
      type: 'bar',
      data: {
        labels: mockPopularServices.labels,
        datasets: [{
          label: 'Bookings',
          data: mockPopularServices.data,
          backgroundColor: accentColor,
          borderRadius: 6
        }]
      },
      options: {
        ...sharedOptions,
        plugins: {
          ...sharedOptions.plugins,
          legend: { display: false },
          title: { display: true, text: 'Popular Services', color: textColor }
        }
      }
    });
  }

  if (has('ratingsChart')) {
    new Chart(has('ratingsChart'), {
      type: 'line',
      data: {
        labels: mockRatings.labels,
        datasets: [{
          label: 'Average Rating',
          data: mockRatings.data,
          borderColor: accentColor,
          backgroundColor: accentBg,
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        ...sharedOptions,
        plugins: {
          ...sharedOptions.plugins,
          legend: { display: false },
          title: { display: true, text: 'Average Customer Ratings', color: textColor }
        },
        scales: {
          ...sharedOptions.scales,
          y: { ...sharedOptions.scales.y, min: 1, max: 5 }
        }
      }
    });
  }

  if (has('serviceBreakdownChart')) {
    new Chart(has('serviceBreakdownChart'), {
      type: 'doughnut',
      data: {
        labels: mockServiceBreakdown.labels,
        datasets: [{
          data: mockServiceBreakdown.data,
          backgroundColor: isDark
            ? ['#6ea8fe', '#8bb9fe', '#a8c8ff', '#c5d8ff', '#e0e8ff']
            : ['#212529', '#495057', '#6c757d', '#adb5bd', '#dee2e6']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { color: textColor } },
          title: { display: true, text: '% of Bookings per Service Type', color: textColor }
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', drawCharts);

const observer = new MutationObserver((mutations) => {
  mutations.forEach(m => {
    if (m.attributeName === 'data-bs-theme') {
      setTimeout(drawCharts, 50);
    }
  });
});
observer.observe(document.documentElement, { attributes: true });