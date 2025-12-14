import { useState } from 'react'
import './OpportunityCostCalculator.css'

function OpportunityCostCalculator() {
  const [optionA, setOptionA] = useState({
    name: 'Option A',
    cost: 0,
    return: 0,
    time: 1
  })
  
  const [optionB, setOptionB] = useState({
    name: 'Option B',
    cost: 0,
    return: 0,
    time: 1
  })

  const calculateROI = (cost, returnValue, time) => {
    if (cost === 0 || time === 0) return 0
    return ((returnValue - cost) / cost) * (12 / time) * 100
  }

  const calculateNetValue = (cost, returnValue) => {
    return returnValue - cost
  }

  const roiA = calculateROI(optionA.cost, optionA.return, optionA.time)
  const roiB = calculateROI(optionB.cost, optionB.return, optionB.time)
  const netValueA = calculateNetValue(optionA.cost, optionA.return)
  const netValueB = calculateNetValue(optionB.cost, optionB.return)
  const opportunityCost = netValueA - netValueB

  const updateOption = (option, field, value) => {
    const numValue = parseFloat(value) || 0
    if (option === 'A') {
      setOptionA(prev => ({ ...prev, [field]: numValue }))
    } else {
      setOptionB(prev => ({ ...prev, [field]: numValue }))
    }
  }

  return (
    <div className="calculator-container">
      <div className="calculator-header">
        <h1>Opportunity Cost Calculator</h1>
        <p>Compare two investment options to see which provides better value</p>
      </div>

      <div className="options-grid">
        {/* Option A */}
        <div className="option-card">
          <div className="option-header">
            <input
              type="text"
              value={optionA.name}
              onChange={(e) => updateOption('A', 'name', e.target.value)}
              className="option-name-input"
              placeholder="Option Name"
            />
          </div>
          
          <div className="input-group">
            <label>Initial Cost ($)</label>
            <input
              type="number"
              value={optionA.cost || ''}
              onChange={(e) => updateOption('A', 'cost', e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>

          <div className="input-group">
            <label>Expected Return ($)</label>
            <input
              type="number"
              value={optionA.return || ''}
              onChange={(e) => updateOption('A', 'return', e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>

          <div className="input-group">
            <label>Time Period (months)</label>
            <input
              type="number"
              value={optionA.time || ''}
              onChange={(e) => updateOption('A', 'time', e.target.value)}
              placeholder="1"
              min="0.1"
              step="0.1"
            />
          </div>

          <div className="results-box">
            <div className="result-item">
              <span className="result-label">Net Value:</span>
              <span className={`result-value ${netValueA >= 0 ? 'positive' : 'negative'}`}>
                ${netValueA.toFixed(2)}
              </span>
            </div>
            <div className="result-item">
              <span className="result-label">Annualized ROI:</span>
              <span className={`result-value ${roiA >= 0 ? 'positive' : 'negative'}`}>
                {roiA.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Option B */}
        <div className="option-card">
          <div className="option-header">
            <input
              type="text"
              value={optionB.name}
              onChange={(e) => updateOption('B', 'name', e.target.value)}
              className="option-name-input"
              placeholder="Option Name"
            />
          </div>
          
          <div className="input-group">
            <label>Initial Cost ($)</label>
            <input
              type="number"
              value={optionB.cost || ''}
              onChange={(e) => updateOption('B', 'cost', e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>

          <div className="input-group">
            <label>Expected Return ($)</label>
            <input
              type="number"
              value={optionB.return || ''}
              onChange={(e) => updateOption('B', 'return', e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>

          <div className="input-group">
            <label>Time Period (months)</label>
            <input
              type="number"
              value={optionB.time || ''}
              onChange={(e) => updateOption('B', 'time', e.target.value)}
              placeholder="1"
              min="0.1"
              step="0.1"
            />
          </div>

          <div className="results-box">
            <div className="result-item">
              <span className="result-label">Net Value:</span>
              <span className={`result-value ${netValueB >= 0 ? 'positive' : 'negative'}`}>
                ${netValueB.toFixed(2)}
              </span>
            </div>
            <div className="result-item">
              <span className="result-label">Annualized ROI:</span>
              <span className={`result-value ${roiB >= 0 ? 'positive' : 'negative'}`}>
                {roiB.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Result */}
      <div className="comparison-card">
        <h2>Opportunity Cost Analysis</h2>
        <div className="comparison-content">
          <div className="comparison-item">
            <span className="comparison-label">Choosing {optionA.name} over {optionB.name}:</span>
            <span className={`comparison-value ${opportunityCost >= 0 ? 'positive' : 'negative'}`}>
              ${opportunityCost.toFixed(2)}
            </span>
          </div>
          <div className="comparison-item">
            <span className="comparison-label">Choosing {optionB.name} over {optionA.name}:</span>
            <span className={`comparison-value ${-opportunityCost >= 0 ? 'positive' : 'negative'}`}>
              ${(-opportunityCost).toFixed(2)}
            </span>
          </div>
          <div className="recommendation">
            <strong>
              {opportunityCost > 0 
                ? `✓ ${optionA.name} is better by $${opportunityCost.toFixed(2)}`
                : opportunityCost < 0
                ? `✓ ${optionB.name} is better by $${(-opportunityCost).toFixed(2)}`
                : 'Both options have equal value'}
            </strong>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OpportunityCostCalculator

