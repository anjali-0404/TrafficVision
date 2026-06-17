/* ============================================================
   predictions.js — Forecast Data for Predictive Module
   TrafficVision AI
   ============================================================ */

window.PredictionData = {
  // 24-hour forecast from current time
  forecast24h: (() => {
    const now   = new Date();
    const hours = [];
    const base  = [8, 6, 5, 4, 5, 7, 14, 28, 35, 30, 25, 22, 26, 28, 24, 30, 38, 45, 42, 35, 28, 22, 18, 12];
    for (let i = 0; i < 24; i++) {
      const h = new Date(now);
      h.setHours(now.getHours() + i, 0, 0, 0);
      const baseVal = base[(now.getHours() + i) % 24];
      hours.push({
        label: h.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        predicted: baseVal + Math.round((Math.random() - 0.5) * 6),
        upper:     baseVal + Math.round(Math.random() * 8) + 5,
        lower:     Math.max(0, baseVal - Math.round(Math.random() * 6) - 2),
        isPast:    i < 3,
      });
    }
    return hours;
  })(),

  // Zone-wise risk predictions
  zonePredictions: [
    { zone: 'SG Highway Junction',     currentRisk: 95, predictedRisk: 98, trend: 'up',   eta: '30 min' },
    { zone: 'Drive-in Road Junction',  currentRisk: 91, predictedRisk: 89, trend: 'down', eta: '45 min' },
    { zone: 'Thaltej Crossroads',      currentRisk: 89, predictedRisk: 93, trend: 'up',   eta: '20 min' },
    { zone: 'Prahlad Nagar Junction',  currentRisk: 85, predictedRisk: 87, trend: 'up',   eta: '60 min' },
    { zone: 'Science City Road',       currentRisk: 80, predictedRisk: 76, trend: 'down', eta: '90 min' },
    { zone: 'Naranpura Circle',        currentRisk: 82, predictedRisk: 84, trend: 'up',   eta: '40 min' },
    { zone: 'Satellite Road Crossing', currentRisk: 78, predictedRisk: 75, trend: 'down', eta: '70 min' },
    { zone: 'ISCON Temple Road',       currentRisk: 76, predictedRisk: 80, trend: 'up',   eta: '50 min' },
  ],

  // Weather correlation factors
  weatherFactors: [
    { icon: '🌧️', name: 'Rain',           impact: '+32%',  active: false, multiplier: 1.32 },
    { icon: '🌫️', name: 'Fog',            impact: '+48%',  active: false, multiplier: 1.48 },
    { icon: '🌙', name: 'Night Time',     impact: '+25%',  active: false, multiplier: 1.25 },
    { icon: '🎉', name: 'Public Holiday', impact: '+18%',  active: true,  multiplier: 1.18 },
    { icon: '🏟️', name: 'Event Nearby',   impact: '+40%',  active: false, multiplier: 1.40 },
    { icon: '☀️', name: 'Clear Weather',  impact: 'Normal',active: true,  multiplier: 1.00 },
  ],

  // Historical model accuracy
  modelMetrics: {
    accuracy: 91.4,
    maeScore: 3.2,
    r2Score:  0.87,
    modelType: 'LSTM + XGBoost Ensemble',
    lastTrained: '2 days ago',
    dataPoints: 185432,
  },

  // Weekly pattern
  weeklyPattern: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    predicted: [142, 138, 155, 162, 178, 195, 168],
    actual:    [138, 141, 152, 159, 182, 191, 171],
  },
};
