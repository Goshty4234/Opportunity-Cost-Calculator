import { useState, useEffect } from 'react'
import './OpportunityCostCalculator.css'

// Helper function to format large numbers with abbreviations
const formatCurrency = (value) => {
  const absValue = Math.abs(value)
  if (absValue >= 1000000) {
    return `${value < 0 ? '-' : ''}$${(absValue / 1000000).toFixed(1)}M`
  } else if (absValue >= 1000) {
    return `${value < 0 ? '-' : ''}$${(absValue / 1000).toFixed(0)}K`
  } else {
    return `$${value.toLocaleString(undefined, {maximumFractionDigits: 0})}`
  }
}

function OpportunityCostCalculator() {
  // Default values
  const defaultYears = 20
  const defaultMarketRate = 7
  const defaultOptionA = {
    name: 'Work Now',
    initialSalary: 75000,
    salaryGrowthRate: 3,
    tuitionCost: 0,
    tuitionYears: 0,
    yearsDelay: 0
  }
  const defaultOptionB = {
    name: 'Get Master Degree',
    initialSalary: 85000,
    salaryGrowthRate: 3,
    tuitionCost: 50000,
    tuitionYears: 1,
    yearsDelay: 0
  }

  // Function to load state from URL parameters
  const loadStateFromURL = () => {
    const params = new URLSearchParams(window.location.search)
    
    const loadedYears = params.get('years') ? parseInt(params.get('years')) : defaultYears
    const loadedMarketRate = params.get('marketRate') ? parseFloat(params.get('marketRate')) : defaultMarketRate
    
    const loadedOptionA = {
      name: params.get('optionA_name') || defaultOptionA.name,
      initialSalary: params.get('optionA_initialSalary') ? parseFloat(params.get('optionA_initialSalary')) : defaultOptionA.initialSalary,
      salaryGrowthRate: params.get('optionA_salaryGrowthRate') ? parseFloat(params.get('optionA_salaryGrowthRate')) : defaultOptionA.salaryGrowthRate,
      tuitionCost: params.get('optionA_tuitionCost') ? parseFloat(params.get('optionA_tuitionCost')) : defaultOptionA.tuitionCost,
      tuitionYears: params.get('optionA_tuitionYears') ? parseInt(params.get('optionA_tuitionYears')) : defaultOptionA.tuitionYears,
      yearsDelay: params.get('optionA_yearsDelay') ? parseInt(params.get('optionA_yearsDelay')) : defaultOptionA.yearsDelay
    }
    
    const loadedOptionB = {
      name: params.get('optionB_name') || defaultOptionB.name,
      initialSalary: params.get('optionB_initialSalary') ? parseFloat(params.get('optionB_initialSalary')) : defaultOptionB.initialSalary,
      salaryGrowthRate: params.get('optionB_salaryGrowthRate') ? parseFloat(params.get('optionB_salaryGrowthRate')) : defaultOptionB.salaryGrowthRate,
      tuitionCost: params.get('optionB_tuitionCost') ? parseFloat(params.get('optionB_tuitionCost')) : defaultOptionB.tuitionCost,
      tuitionYears: params.get('optionB_tuitionYears') ? parseInt(params.get('optionB_tuitionYears')) : defaultOptionB.tuitionYears,
      yearsDelay: params.get('optionB_yearsDelay') ? parseInt(params.get('optionB_yearsDelay')) : defaultOptionB.yearsDelay
    }
    
    return { loadedYears, loadedMarketRate, loadedOptionA, loadedOptionB }
  }

  // Initialize state from URL or defaults
  const initialState = loadStateFromURL()
  
  const [years, setYears] = useState(initialState.loadedYears)
  const [marketRate, setMarketRate] = useState(initialState.loadedMarketRate)
  
  const [optionA, setOptionA] = useState(initialState.loadedOptionA)
  const [optionB, setOptionB] = useState(initialState.loadedOptionB)
  
  // State for hover tooltip
  const [hoveredYear, setHoveredYear] = useState(null)
  
  // Function to generate shareable link
  const generateShareLink = () => {
    const params = new URLSearchParams()
    
    params.set('years', years.toString())
    params.set('marketRate', marketRate.toString())
    
    params.set('optionA_name', optionA.name)
    params.set('optionA_initialSalary', optionA.initialSalary.toString())
    params.set('optionA_salaryGrowthRate', optionA.salaryGrowthRate.toString())
    params.set('optionA_tuitionCost', optionA.tuitionCost.toString())
    params.set('optionA_tuitionYears', optionA.tuitionYears.toString())
    params.set('optionA_yearsDelay', optionA.yearsDelay.toString())
    
    params.set('optionB_name', optionB.name)
    params.set('optionB_initialSalary', optionB.initialSalary.toString())
    params.set('optionB_salaryGrowthRate', optionB.salaryGrowthRate.toString())
    params.set('optionB_tuitionCost', optionB.tuitionCost.toString())
    params.set('optionB_tuitionYears', optionB.tuitionYears.toString())
    params.set('optionB_yearsDelay', optionB.yearsDelay.toString())
    
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`
  }
  
  // Function to copy link to clipboard
  const copyShareLink = async () => {
    try {
      const link = generateShareLink()
      await navigator.clipboard.writeText(link)
      alert('Link copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy link:', err)
      alert('Failed to copy link. Please try again.')
    }
  }

  // Calculate future value of an option
  // Years start at 1 instead of 0
  const calculateFutureValue = (option) => {
    const rate = (marketRate || 0) / 100
    const salaryGrowth = (option.salaryGrowthRate || 0) / 100
    let futureValue = 0
    
    // Calculate future value of tuition costs (negative cash flows)
    // Years start at 1, so tuition is in years 1 to tuitionYears
    for (let year = 1; year <= (option.tuitionYears || 0); year++) {
      const tuitionFV = (option.tuitionCost || 0) * Math.pow(1 + rate, (years || 0) - year + 1)
      futureValue -= tuitionFV
    }
    
    // Calculate future value of salary investments (positive cash flows)
    // Salary starts after delay + tuition years
    const startYear = (option.yearsDelay || 0) + (option.tuitionYears || 0)
    
    for (let year = startYear + 1; year <= (years || 0); year++) {
      // Calculate salary for this year (with growth)
      // First year of work has no growth, growth applies from second year onwards
      const yearsWorked = Math.max(0, year - startYear - 1)
      const currentSalary = (option.initialSalary || 0) * Math.pow(1 + salaryGrowth, yearsWorked)
      
      // Future value of this year's salary investment
      const yearsToCompound = (years || 0) - year + 1
      const salaryFV = currentSalary * Math.pow(1 + rate, yearsToCompound)
      futureValue += salaryFV
    }
    
    return futureValue
  }

  const futureValueA = calculateFutureValue(optionA)
  const futureValueB = calculateFutureValue(optionB)
  const opportunityCost = futureValueA - futureValueB
  const percentageDiff = futureValueB !== 0 ? ((futureValueA - futureValueB) / Math.abs(futureValueB)) * 100 : 0

  const updateOption = (option, field, value) => {
    // If field is 'name', keep it as text, otherwise convert to number
    if (field === 'name') {
      if (option === 'A') {
        setOptionA(prev => ({ ...prev, [field]: value }))
      } else {
        setOptionB(prev => ({ ...prev, [field]: value }))
      }
    } else {
      // Convert to number, default to 0 if empty
      const numValue = parseFloat(value) || 0
      if (option === 'A') {
        setOptionA(prev => ({ ...prev, [field]: numValue }))
      } else {
        setOptionB(prev => ({ ...prev, [field]: numValue }))
      }
    }
  }

  // Generate year-by-year breakdown with detailed financial metrics
  // Years start at 1 instead of 0
  const generateYearlyBreakdown = (option) => {
    const rate = (marketRate || 0) / 100
    const salaryGrowth = (option.salaryGrowthRate || 0) / 100
    const breakdown = []
    
    // Track values year by year
    let netWorth = 0 // Cumulative value with interest (same as cumulative graph)
    let valueWithoutInterest = 0 // Sum of cash flows without interest
    let previousNetWorth = 0
    
    // Start from year 1 to years (inclusive)
    for (let year = 1; year <= (years || 0); year++) {
      // Calculate cash flow for this year (salary + tuition, without interest)
      let cashFlowThisYear = 0
      let description = ''
      
      // Tuition costs (negative cash flow)
      if (year <= (option.tuitionYears || 0)) {
        cashFlowThisYear -= (option.tuitionCost || 0)
        description = `Tuition: -$${(option.tuitionCost || 0).toLocaleString()}`
      }
      
      // Salary (positive cash flow)
      const startYear = (option.yearsDelay || 0) + (option.tuitionYears || 0)
      if (year > startYear) {
        // First year of work has no growth, growth applies from second year onwards
        const yearsWorked = Math.max(0, year - startYear - 1)
        const currentSalary = (option.initialSalary || 0) * Math.pow(1 + salaryGrowth, yearsWorked)
        cashFlowThisYear += currentSalary
        description = `Salary: $${currentSalary.toLocaleString(undefined, {maximumFractionDigits: 0})}`
      } else if (year > (option.yearsDelay || 0) && year <= startYear) {
        description = 'Studying...'
      } else if (year <= (option.yearsDelay || 0)) {
        description = 'Waiting...'
      }
      
      // Add cash flow to value without interest
      valueWithoutInterest += cashFlowThisYear
      
      // Calculate interest gain for this year (only if previous net worth is positive)
      let interestGainThisYear = 0
      if (previousNetWorth > 0) {
        interestGainThisYear = previousNetWorth * rate
      }
      
      // Update net worth: add cash flow first, then apply interest if positive
      netWorth = previousNetWorth + cashFlowThisYear
      if (netWorth > 0) {
        netWorth = netWorth * (1 + rate)
        // Interest gain is the difference after applying interest
        interestGainThisYear = netWorth - (previousNetWorth + cashFlowThisYear)
      } else {
        // If negative, no interest is applied
        interestGainThisYear = 0
      }
      
      // Total gain/loss for the year
      const totalGainLossThisYear = cashFlowThisYear + interestGainThisYear
      
      breakdown.push({
        year,
        netWorth: netWorth,
        valueWithoutInterest: valueWithoutInterest,
        interestGainLoss: interestGainThisYear,
        cashFlowGainLoss: cashFlowThisYear,
        totalGainLoss: totalGainLossThisYear,
        description
      })
      
      previousNetWorth = netWorth
    }
    
    return breakdown
  }

  const breakdownA = generateYearlyBreakdown(optionA)
  const breakdownB = generateYearlyBreakdown(optionB)

  // Generate yearly cash flows for arrow visualization (actual values, not future values)
  // Years start at 1 instead of 0, so 20 years = Y1 to Y20
  const generateYearlyCashFlows = (option) => {
    const salaryGrowth = (option.salaryGrowthRate || 0) / 100
    const cashFlows = []
    const startYear = (option.yearsDelay || 0) + (option.tuitionYears || 0)
    
    // Start from year 1 to years (inclusive), so exactly 'years' total years
    for (let year = 1; year <= years; year++) {
      let value = 0
      let label = ''
      
      // Tuition costs (negative) - year 0-based logic, but display as year 1-based
      if (year <= (option.tuitionYears || 0)) {
        value = -(option.tuitionCost || 0)
        label = `Tuition: $${(option.tuitionCost || 0).toLocaleString()}`
      }
      // Salary (positive)
      else if (year > startYear) {
        // First year of work has no growth, growth applies from second year onwards
        const yearsWorked = Math.max(0, year - startYear - 1)
        value = (option.initialSalary || 0) * Math.pow(1 + salaryGrowth, yearsWorked)
        label = `Salary: $${value.toLocaleString(undefined, {maximumFractionDigits: 0})}`
      }
      
      cashFlows.push({
        year,
        value,
        label,
        isPositive: value > 0,
        isNegative: value < 0
      })
    }
    
    return cashFlows
  }

  // Generate cumulative future value over time - based on the same cash flows as the cash flow graphs
  // Interest is only applied when cumulative value is above 0
  // Years start at 1 instead of 0
  const generateCumulativeValues = (option) => {
    const rate = (marketRate || 0) / 100
    const cashFlows = generateYearlyCashFlows(option)
    const cumulative = []
    
    // Track cumulative value year by year, only applying interest when above 0
    let runningBalance = 0
    
    // Start from year 1 to years (inclusive)
    for (let currentYear = 1; currentYear <= years; currentYear++) {
      // Add the cash flow for this year (cashFlows array is indexed by year-1 since it starts at 1)
      const cashFlow = cashFlows[currentYear - 1]
      if (cashFlow) {
        runningBalance += cashFlow.value
      }
      
      // Apply interest only if balance is positive
      // Interest is applied at the end of the year
      if (currentYear > 1) {
        if (runningBalance > 0) {
          // Apply interest to the positive balance
          runningBalance = runningBalance * (1 + rate)
        }
        // If negative, no interest is applied (debt doesn't earn interest)
      }
      
      cumulative.push({
        year: currentYear,
        value: runningBalance
      })
    }
    
    return cumulative
  }

  const cashFlowsA = generateYearlyCashFlows(optionA)
  const cashFlowsB = generateYearlyCashFlows(optionB)
  const cumulativeA = generateCumulativeValues(optionA)
  const cumulativeB = generateCumulativeValues(optionB)

  // Find max values for scaling (separate for positive and negative, per option)
  const valuesA = cashFlowsA.map(cf => cf.value)
  const valuesB = cashFlowsB.map(cf => cf.value)
  
  const positiveA = valuesA.filter(v => v > 0)
  const negativeA = valuesA.filter(v => v < 0)
  const maxPositiveA = positiveA.length > 0 ? Math.max(...positiveA) : 0
  const maxNegativeA = negativeA.length > 0 ? Math.abs(Math.min(...negativeA)) : 0
  // Use the maximum absolute value for proportional scaling
  const maxAbsoluteA = Math.max(maxPositiveA, maxNegativeA)
  
  const positiveB = valuesB.filter(v => v > 0)
  const negativeB = valuesB.filter(v => v < 0)
  const maxPositiveB = positiveB.length > 0 ? Math.max(...positiveB) : 0
  const maxNegativeB = negativeB.length > 0 ? Math.abs(Math.min(...negativeB)) : 0
  // Use the maximum absolute value for proportional scaling
  const maxAbsoluteB = Math.max(maxPositiveB, maxNegativeB)
  
  // Keep overall max for cumulative graph
  const allValues = [...valuesA, ...valuesB]
  const maxCashFlow = Math.max(
    ...allValues.filter(v => v > 0),
    ...allValues.map(v => Math.abs(v)),
    1
  )
  // Calculate min and max cumulative values (including negatives)
  const allCumulativeValues = [
    ...cumulativeA.map(c => c.value),
    ...cumulativeB.map(c => c.value)
  ]
  const minCumulative = allCumulativeValues.length > 0 ? Math.min(...allCumulativeValues) : 0
  const maxCumulative = allCumulativeValues.length > 0 ? Math.max(...allCumulativeValues) : 1
  const rangeCumulative = maxCumulative - minCumulative || 1 // Avoid division by zero

  return (
    <div className="calculator-container">
      <div className="calculator-header">
        <div style={{ textAlign: 'right', fontSize: '12px', color: '#999', marginBottom: '5px' }}>
          Made by Nicolas Cool
        </div>
        <h1>Opportunity Cost Calculator</h1>
        <p>Compare career and education paths over time with compound interest</p>
      </div>

      {/* Global Settings */}
      <div className="settings-card">
        <h3>Global Settings</h3>
        <div className="settings-grid">
          <div className="input-group">
            <label>Analysis Period (years)</label>
            <input
              type="number"
              value={years === 0 ? 0 : (years ?? '')}
              onChange={(e) => setYears(e.target.value === '' ? 0 : (parseFloat(e.target.value) || 0))}
              placeholder="20"
              min="1"
              step="1"
            />
          </div>
          <div className="input-group">
            <label>Market Rate (% per year)</label>
            <input
              type="number"
              value={marketRate === 0 ? 0 : (marketRate ?? '')}
              onChange={(e) => setMarketRate(e.target.value === '' ? 0 : (parseFloat(e.target.value) || 0))}
              placeholder="7"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </div>
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
            <label>Initial Salary ($)</label>
            <input
              type="number"
              value={optionA.initialSalary === 0 ? 0 : (optionA.initialSalary ?? '')}
              onChange={(e) => updateOption('A', 'initialSalary', e.target.value)}
              placeholder="75000"
              min="0"
              step="1000"
            />
          </div>

          <div className="input-group">
            <label>Salary Growth Rate (% per year)</label>
            <input
              type="number"
              value={optionA.salaryGrowthRate === 0 ? 0 : (optionA.salaryGrowthRate ?? '')}
              onChange={(e) => updateOption('A', 'salaryGrowthRate', e.target.value)}
              placeholder="3"
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <div className="input-group">
            <label>Tuition Cost per Year ($)</label>
            <input
              type="number"
              value={optionA.tuitionCost === 0 ? 0 : (optionA.tuitionCost ?? '')}
              onChange={(e) => updateOption('A', 'tuitionCost', e.target.value)}
              placeholder="0"
              min="0"
              step="1000"
            />
          </div>

          <div className="input-group">
            <label>Years of Tuition</label>
            <input
              type="number"
              value={optionA.tuitionYears === 0 ? 0 : (optionA.tuitionYears ?? '')}
              onChange={(e) => updateOption('A', 'tuitionYears', e.target.value)}
              placeholder="0"
              min="0"
              step="1"
            />
          </div>

          <div className="input-group">
            <label>Years Delay Before Starting Work</label>
            <input
              type="number"
              value={optionA.yearsDelay === 0 ? 0 : (optionA.yearsDelay ?? '')}
              onChange={(e) => updateOption('A', 'yearsDelay', e.target.value)}
              placeholder="0"
              min="0"
              step="1"
            />
          </div>

          <div className="results-box">
            <div className="result-item">
              <span className="result-label">Future Value:</span>
              <span className="result-value positive">
                ${futureValueA.toLocaleString(undefined, {maximumFractionDigits: 0})}
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
            <label>Initial Salary ($)</label>
            <input
              type="number"
              value={optionB.initialSalary === 0 ? 0 : (optionB.initialSalary ?? '')}
              onChange={(e) => updateOption('B', 'initialSalary', e.target.value)}
              placeholder="85000"
              min="0"
              step="1000"
            />
          </div>

          <div className="input-group">
            <label>Salary Growth Rate (% per year)</label>
            <input
              type="number"
              value={optionB.salaryGrowthRate === 0 ? 0 : (optionB.salaryGrowthRate ?? '')}
              onChange={(e) => updateOption('B', 'salaryGrowthRate', e.target.value)}
              placeholder="3"
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <div className="input-group">
            <label>Tuition Cost per Year ($)</label>
            <input
              type="number"
              value={optionB.tuitionCost === 0 ? 0 : (optionB.tuitionCost ?? '')}
              onChange={(e) => updateOption('B', 'tuitionCost', e.target.value)}
              placeholder="50000"
              min="0"
              step="1000"
            />
          </div>

          <div className="input-group">
            <label>Years of Tuition</label>
            <input
              type="number"
              value={optionB.tuitionYears === 0 ? 0 : (optionB.tuitionYears ?? '')}
              onChange={(e) => updateOption('B', 'tuitionYears', e.target.value)}
              placeholder="1"
              min="0"
              step="1"
            />
          </div>

          <div className="input-group">
            <label>Years Delay Before Starting Work</label>
            <input
              type="number"
              value={optionB.yearsDelay === 0 ? 0 : (optionB.yearsDelay ?? '')}
              onChange={(e) => updateOption('B', 'yearsDelay', e.target.value)}
              placeholder="1"
              min="0"
              step="1"
            />
          </div>

          <div className="results-box">
            <div className="result-item">
              <span className="result-label">Future Value:</span>
              <span className="result-value positive">
                ${futureValueB.toLocaleString(undefined, {maximumFractionDigits: 0})}
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
            <span className="comparison-label">Future Value of {optionA.name}:</span>
            <span className="comparison-value positive">
              ${futureValueA.toLocaleString(undefined, {maximumFractionDigits: 0})}
            </span>
          </div>
          <div className="comparison-item">
            <span className="comparison-label">Future Value of {optionB.name}:</span>
            <span className="comparison-value positive">
              ${futureValueB.toLocaleString(undefined, {maximumFractionDigits: 0})}
            </span>
          </div>
          <div className="comparison-item highlight">
            <span className="comparison-label">Opportunity Cost (Choosing {optionA.name} over {optionB.name}):</span>
            <span className={`comparison-value ${opportunityCost >= 0 ? 'positive' : 'negative'}`}>
              {opportunityCost >= 0 ? '+' : '-'}${Math.abs(opportunityCost).toLocaleString(undefined, {maximumFractionDigits: 0})}
            </span>
          </div>
          <div className="comparison-item highlight">
            <span className="comparison-label">Percentage Difference:</span>
            <span className={`comparison-value ${opportunityCost >= 0 ? 'positive' : 'negative'}`}>
              {percentageDiff.toFixed(1)}%
            </span>
          </div>
          <div className="recommendation">
            <strong>
              {opportunityCost > 0 
                ? `✓ ${optionA.name} is better by $${opportunityCost.toLocaleString(undefined, {maximumFractionDigits: 0})} (${percentageDiff.toFixed(1)}%)`
                : opportunityCost < 0
                ? `✓ ${optionB.name} is better by $${(-opportunityCost).toLocaleString(undefined, {maximumFractionDigits: 0})} (${(-percentageDiff).toFixed(1)}%)`
                : 'Both options have equal future value'}
            </strong>
          </div>
          
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button 
              onClick={copyShareLink}
              style={{
                padding: '12px 24px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#764ba2'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
            >
              📋 Copy Share Link
            </button>
            <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
              Share this link to preserve all your settings
            </p>
          </div>
        </div>
      </div>

      {/* Cash Flow Plot with X-Y Axes */}
      <div className="visualization-section">
        <h2>Year-by-Year Cash Flow Plot</h2>
        <p className="section-subtitle">X-axis: Years | Y-axis: Cash Flow ($) | Green bars = Returns | Red bars = Costs</p>
        
        <div className="plot-grid">
          <div className="plot-card">
            <h3>{optionA.name}</h3>
            <div className="plot-container">
              <svg className="cash-flow-plot" viewBox={`0 0 ${Math.max(years * 50, 1000)} 520`} preserveAspectRatio="none">
                {/* Y-axis - adjust based on whether we have negative values */}
                {maxNegativeA > 0 ? (
                  <>
                    {/* Y-axis - extended to show negative values */}
                    <line x1="80" y1="40" x2="80" y2="460" stroke="#333" strokeWidth="2" />
                    {/* X-axis - positioned in middle to show both positive and negative */}
                    <line x1="80" y1="250" x2={Math.max(years * 50, 1000) - 50} y2="250" stroke="#333" strokeWidth="2" />
                    
                    {/* Y-axis labels - separate scaling for positive and negative (Option A) */}
                    {(() => {
                      // Use separate max values for positive and negative sides
                      return [
                        {ratio: -1, value: -maxNegativeA},
                        {ratio: -0.5, value: -maxNegativeA / 2},
                        {ratio: 0, value: 0},
                        {ratio: 0.5, value: maxPositiveA / 2},
                        {ratio: 1, value: maxPositiveA}
                      ].map((item, idx) => {
                        // Calculate Y position: symmetric around zero line (250)
                        const y = 250 - (item.ratio * 210) // -1 ratio = 460, 0 = 250, 1 = 40
                        return (
                          <g key={idx}>
                            <line x1="75" y1={y} x2="80" y2={y} stroke="#333" strokeWidth="1" />
                            <text x="70" y={y + 4} fill="#666" fontSize="12" textAnchor="end">
                              ${item.value.toLocaleString(undefined, {maximumFractionDigits: 0})}
                            </text>
                          </g>
                        )
                      })
                    })()}
                  </>
                ) : (
                  <>
                    {/* Y-axis - only positive values, X-axis at bottom */}
                    <line x1="80" y1="40" x2="80" y2="460" stroke="#333" strokeWidth="2" />
                    {/* X-axis - at bottom since no negative values */}
                    <line x1="80" y1="460" x2={Math.max(years * 50, 1000) - 50} y2="460" stroke="#333" strokeWidth="2" />
                    
                    {/* Y-axis labels - only positive values */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                      const value = maxPositiveA * ratio
                      const y = 460 - (ratio * 420) // Full range from bottom (460) to top (40)
                      return (
                        <g key={idx}>
                          <line x1="75" y1={y} x2="80" y2={y} stroke="#333" strokeWidth="1" />
                          <text x="70" y={y + 4} fill="#666" fontSize="12" textAnchor="end">
                            ${value.toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </text>
                        </g>
                      )
                    })}
                  </>
                )}
                
                {/* Cash flow bars */}
                {(() => {
                  // Determine zero position based on whether we have negative values
                  const zeroY = maxNegativeA > 0 ? 250 : 460 // Bottom if no negatives, middle if negatives exist
                  const maxBarHeightPositive = maxNegativeA > 0 ? 210 : 420 // Height for positive bars
                  const maxBarHeightNegative = maxNegativeA > 0 ? 210 : 0 // Height for negative bars
                  
                  // Calculate max year label Y position once for all bars to ensure alignment
                  // Include all years, even those with value 0
                  let maxYearY = 480
                  cashFlowsA.forEach(cf => {
                    if (cf.value === 0) {
                      // For years with value 0, just use a default position
                      maxYearY = Math.max(maxYearY, 480)
                      return
                    }
                    let barHeight, y, height
                    // Use separate scaling for positive and negative values
                    if (cf.isPositive) {
                      barHeight = maxPositiveA > 0 ? (cf.value / maxPositiveA) * maxBarHeightPositive : 0
                      y = zeroY - barHeight
                      height = barHeight
                    } else {
                      barHeight = maxNegativeA > 0 ? (Math.abs(cf.value) / maxNegativeA) * maxBarHeightNegative : 0
                      y = zeroY
                      height = barHeight
                    }
                    const valueY = cf.isPositive ? y - 10 : y + height + 20
                    maxYearY = Math.max(maxYearY, valueY + 30)
                  })
                  
                  return cashFlowsA.map((cf, idx) => {
                    const plotWidth = Math.max(years * 50, 1000) - 200
                    // We have years points (1 to years), so divide by years
                    const barWidth = plotWidth / Math.max(years, 1)
                    // Position based on year (1 to years), so year 1 is at first position
                    const x = 100 + ((cf.year - 1) * barWidth) + (barWidth / 2)
                    
                    // If value is 0, only show year label, no bar
                    if (cf.value === 0) {
                      return (
                        <g key={idx}>
                          {/* Year label only */}
                          <text
                            x={x}
                            y={maxYearY}
                            fill="#666"
                            fontSize="11"
                            textAnchor="middle"
                          >
                            Y{cf.year}
                          </text>
                        </g>
                      )
                    }
                    
                    // Calculate bar dimensions with separate scaling for positive and negative (Option A)
                    let barHeight, y, height
                    // Use separate scaling: positive bars use maxPositiveA, negative bars use maxNegativeA
                    if (cf.isPositive) {
                      // Positive bar: goes up from zero line, scaled to maxPositiveA
                      barHeight = maxPositiveA > 0 ? (cf.value / maxPositiveA) * maxBarHeightPositive : 0
                      y = zeroY - barHeight
                      height = barHeight
                    } else {
                      // Negative bar: goes down from zero line, scaled to maxNegativeA
                      barHeight = maxNegativeA > 0 ? (Math.abs(cf.value) / maxNegativeA) * maxBarHeightNegative : 0
                      y = zeroY // Start at zero line
                      height = barHeight // Height extends downward
                    }
                    
                    return (
                      <g key={idx}>
                        {/* Bar */}
                        <rect
                          x={x - barWidth * 0.25}
                          y={y}
                          width={barWidth * 0.5}
                          height={height}
                          fill={cf.isPositive ? "#28a745" : "#dc3545"}
                          opacity="0.8"
                        />
                        {/* Value label */}
                        <text
                          x={x}
                          y={cf.isPositive ? y - 10 : y + height + 20}
                          fill="#333"
                          fontSize="10"
                          textAnchor="middle"
                          fontWeight="600"
                        >
                          ${Math.abs(cf.value).toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </text>
                        {/* Year label - all aligned at same Y position below all value labels */}
                        <text
                          x={x}
                          y={maxYearY}
                          fill="#666"
                          fontSize="11"
                          textAnchor="middle"
                        >
                          Y{cf.year}
                        </text>
                      </g>
                    )
                  })
                })()}
              </svg>
            </div>
          </div>

          <div className="plot-card">
            <h3>{optionB.name}</h3>
            <div className="plot-container">
              <svg className="cash-flow-plot" viewBox={`0 0 ${Math.max(years * 50, 1000)} 520`} preserveAspectRatio="none">
                {/* Y-axis - adjust based on whether we have negative values */}
                {maxNegativeB > 0 ? (
                  <>
                    {/* Y-axis - extended to show negative values */}
                    <line x1="80" y1="40" x2="80" y2="460" stroke="#333" strokeWidth="2" />
                    {/* X-axis - positioned in middle to show both positive and negative */}
                    <line x1="80" y1="250" x2={Math.max(years * 50, 1000) - 50} y2="250" stroke="#333" strokeWidth="2" />
                    
                    {/* Y-axis labels - separate scaling for positive and negative (Option B) */}
                    {(() => {
                      // Use separate max values for positive and negative sides
                      return [
                        {ratio: -1, value: -maxNegativeB},
                        {ratio: -0.5, value: -maxNegativeB / 2},
                        {ratio: 0, value: 0},
                        {ratio: 0.5, value: maxPositiveB / 2},
                        {ratio: 1, value: maxPositiveB}
                      ].map((item, idx) => {
                        // Calculate Y position: symmetric around zero line (250)
                        const y = 250 - (item.ratio * 210) // -1 ratio = 460, 0 = 250, 1 = 40
                        return (
                          <g key={idx}>
                            <line x1="75" y1={y} x2="80" y2={y} stroke="#333" strokeWidth="1" />
                            <text x="70" y={y + 4} fill="#666" fontSize="12" textAnchor="end">
                              ${item.value.toLocaleString(undefined, {maximumFractionDigits: 0})}
                            </text>
                          </g>
                        )
                      })
                    })()}
                  </>
                ) : (
                  <>
                    {/* Y-axis - only positive values, X-axis at bottom */}
                    <line x1="80" y1="40" x2="80" y2="460" stroke="#333" strokeWidth="2" />
                    {/* X-axis - at bottom since no negative values */}
                    <line x1="80" y1="460" x2={Math.max(years * 50, 1000) - 50} y2="460" stroke="#333" strokeWidth="2" />
                    
                    {/* Y-axis labels - only positive values */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                      const value = maxPositiveB * ratio
                      const y = 460 - (ratio * 420) // Full range from bottom (460) to top (40)
                      return (
                        <g key={idx}>
                          <line x1="75" y1={y} x2="80" y2={y} stroke="#333" strokeWidth="1" />
                          <text x="70" y={y + 4} fill="#666" fontSize="12" textAnchor="end">
                            ${value.toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </text>
                        </g>
                      )
                    })}
                  </>
                )}
                
                {/* Cash flow bars */}
                {(() => {
                  // Determine zero position based on whether we have negative values
                  const zeroY = maxNegativeB > 0 ? 250 : 460 // Bottom if no negatives, middle if negatives exist
                  const maxBarHeightPositive = maxNegativeB > 0 ? 210 : 420 // Height for positive bars
                  const maxBarHeightNegative = maxNegativeB > 0 ? 210 : 0 // Height for negative bars
                  
                  // Calculate max year label Y position once for all bars to ensure alignment
                  // Include all years, even those with value 0
                  let maxYearY = 480
                  cashFlowsB.forEach(cf => {
                    if (cf.value === 0) {
                      // For years with value 0, just use a default position
                      maxYearY = Math.max(maxYearY, 480)
                      return
                    }
                    let barHeight, y, height
                    // Use separate scaling for positive and negative values
                    if (cf.isPositive) {
                      barHeight = maxPositiveB > 0 ? (cf.value / maxPositiveB) * maxBarHeightPositive : 0
                      y = zeroY - barHeight
                      height = barHeight
                    } else {
                      barHeight = maxNegativeB > 0 ? (Math.abs(cf.value) / maxNegativeB) * maxBarHeightNegative : 0
                      y = zeroY
                      height = barHeight
                    }
                    const valueY = cf.isPositive ? y - 10 : y + height + 20
                    maxYearY = Math.max(maxYearY, valueY + 30)
                  })
                  
                  return cashFlowsB.map((cf, idx) => {
                    const plotWidth = Math.max(years * 50, 1000) - 200
                    // We have years points (1 to years), so divide by years
                    const barWidth = plotWidth / Math.max(years, 1)
                    // Position based on year (1 to years), so year 1 is at first position
                    const x = 100 + ((cf.year - 1) * barWidth) + (barWidth / 2)
                    
                    // If value is 0, only show year label, no bar
                    if (cf.value === 0) {
                      return (
                        <g key={idx}>
                          {/* Year label only */}
                          <text
                            x={x}
                            y={maxYearY}
                            fill="#666"
                            fontSize="11"
                            textAnchor="middle"
                          >
                            Y{cf.year}
                          </text>
                        </g>
                      )
                    }
                    
                    // Calculate bar dimensions with separate scaling for positive and negative (Option B)
                    let barHeight, y, height
                    // Use separate scaling: positive bars use maxPositiveB, negative bars use maxNegativeB
                    if (cf.isPositive) {
                      // Positive bar: goes up from zero line, scaled to maxPositiveB
                      barHeight = maxPositiveB > 0 ? (cf.value / maxPositiveB) * maxBarHeightPositive : 0
                      y = zeroY - barHeight
                      height = barHeight
                    } else {
                      // Negative bar: goes down from zero line, scaled to maxNegativeB
                      barHeight = maxNegativeB > 0 ? (Math.abs(cf.value) / maxNegativeB) * maxBarHeightNegative : 0
                      y = zeroY // Start at zero line
                      height = barHeight // Height extends downward
                    }
                    
                    return (
                      <g key={idx}>
                        {/* Bar */}
                        <rect
                          x={x - barWidth * 0.25}
                          y={y}
                          width={barWidth * 0.5}
                          height={height}
                          fill={cf.isPositive ? "#28a745" : "#dc3545"}
                          opacity="0.8"
                        />
                        {/* Value label */}
                        <text
                          x={x}
                          y={cf.isPositive ? y - 10 : y + height + 20}
                          fill="#333"
                          fontSize="10"
                          textAnchor="middle"
                          fontWeight="600"
                        >
                          ${Math.abs(cf.value).toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </text>
                        {/* Year label - all aligned at same Y position below all value labels */}
                        <text
                          x={x}
                          y={maxYearY}
                          fill="#666"
                          fontSize="11"
                          textAnchor="middle"
                        >
                          Y{cf.year}
                        </text>
                      </g>
                    )
                  })
                })()}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Cumulative Value Graph */}
      <div className="visualization-section">
        <h2>Cumulative Future Value Over Time</h2>
        <p className="section-subtitle">Shows how your investment grows with {marketRate}% market rate</p>
        
        <div className="graph-container">
          <div className="graph-card">
            <div className="graph-header">
              <div className="graph-legend">
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: '#667eea'}}></div>
                  <span>{optionA.name}</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{backgroundColor: '#764ba2'}}></div>
                  <span>{optionB.name}</span>
                </div>
              </div>
            </div>
            <div className="graph-area">
              <svg className="cumulative-graph" viewBox={`0 0 ${Math.max(years * 50, 1000)} 520`} preserveAspectRatio="none">
                {/* Y-axis */}
                <line x1="80" y1="40" x2="80" y2="460" stroke="#333" strokeWidth="2" />
                
                {/* X-axis - positioned based on whether we have negative values */}
                {(() => {
                  const hasNegatives = minCumulative < 0
                  // Calculate the actual Y position for value 0
                  const zeroValue = 0
                  const normalizedZeroValue = (zeroValue - minCumulative) / rangeCumulative
                  const zeroY = 460 - (normalizedZeroValue * 420)
                  
                  return (
                    <>
                      {/* Zero line - full horizontal line to show positive/negative */}
                      {hasNegatives && (
                        <line 
                          x1="80" 
                          y1={zeroY} 
                          x2={Math.max(years * 50, 1000) - 50} 
                          y2={zeroY} 
                          stroke="#999" 
                          strokeWidth="1" 
                          strokeDasharray="4,4" 
                        />
                      )}
                      
                      {/* Y-axis labels */}
                      {hasNegatives ? (
                        // Show both positive and negative labels
                        [
                          {ratio: -1, value: minCumulative},
                          {ratio: -0.5, value: minCumulative / 2},
                          {ratio: 0, value: 0},
                          {ratio: 0.5, value: maxCumulative / 2},
                          {ratio: 1, value: maxCumulative}
                        ].map((item, idx) => {
                          // Calculate Y position: proportional to range
                          const normalizedValue = (item.value - minCumulative) / rangeCumulative
                          const y = 460 - (normalizedValue * 420)
                          return (
                            <g key={idx}>
                              <line x1="75" y1={y} x2="80" y2={y} stroke="#333" strokeWidth="1" />
                              <text x="70" y={y + 4} fill="#666" fontSize="12" textAnchor="end">
                                {formatCurrency(item.value)}
                              </text>
                            </g>
                          )
                        })
                      ) : (
                        // Show only positive labels
                        [0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                          const value = minCumulative + (rangeCumulative * ratio)
                          const y = 460 - (ratio * 420)
                          return (
                            <g key={idx}>
                              <line x1="75" y1={y} x2="80" y2={y} stroke="#333" strokeWidth="1" />
                              <text x="70" y={y + 4} fill="#666" fontSize="12" textAnchor="end">
                                {formatCurrency(value)}
                              </text>
                            </g>
                          )
                        })
                      )}
                      
                      {/* Grid lines removed */}
                      
                      {/* Option A line */}
                      <polyline
                        points={cumulativeA.map((c, idx) => {
                          const plotWidth = Math.max(years * 50, 1000) - 200
                          // Match cash flow graphs: divide by years, and position at center of segment like bars
                          // Years start at 1, so position is (year - 1) * segmentWidth
                          const segmentWidth = plotWidth / years
                          const x = 100 + ((c.year - 1) * segmentWidth) + (segmentWidth / 2)
                          const normalizedValue = (c.value - minCumulative) / rangeCumulative
                          const y = 460 - (normalizedValue * 420)
                          return `${x},${y}`
                        }).join(' ')}
                        fill="none"
                        stroke="#667eea"
                        strokeWidth="3"
                      />
                      
                      {/* Option B line */}
                      <polyline
                        points={cumulativeB.map((c, idx) => {
                          const plotWidth = Math.max(years * 50, 1000) - 200
                          // Match cash flow graphs: divide by years, and position at center of segment like bars
                          // Years start at 1, so position is (year - 1) * segmentWidth
                          const segmentWidth = plotWidth / years
                          const x = 100 + ((c.year - 1) * segmentWidth) + (segmentWidth / 2)
                          const normalizedValue = (c.value - minCumulative) / rangeCumulative
                          const y = 460 - (normalizedValue * 420)
                          return `${x},${y}`
                        }).join(' ')}
                        fill="none"
                        stroke="#764ba2"
                        strokeWidth="3"
                      />
                      
                      {/* Data points */}
                      {cumulativeA.map((c, idx) => {
                        if (idx % Math.ceil(years / 10) !== 0 && idx !== cumulativeA.length - 1) return null
                        const plotWidth = Math.max(years * 50, 1000) - 200
                        const segmentWidth = plotWidth / years
                        const x = 100 + ((c.year - 1) * segmentWidth) + (segmentWidth / 2)
                        const normalizedValue = (c.value - minCumulative) / rangeCumulative
                        const y = 460 - (normalizedValue * 420)
                        return (
                          <circle
                            key={`a-${idx}`}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#667eea"
                          />
                        )
                      })}
                      {cumulativeB.map((c, idx) => {
                        if (idx % Math.ceil(years / 10) !== 0 && idx !== cumulativeB.length - 1) return null
                        const plotWidth = Math.max(years * 50, 1000) - 200
                        const segmentWidth = plotWidth / years
                        const x = 100 + ((c.year - 1) * segmentWidth) + (segmentWidth / 2)
                        const normalizedValue = (c.value - minCumulative) / rangeCumulative
                        const y = 460 - (normalizedValue * 420)
                        return (
                          <circle
                            key={`b-${idx}`}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#764ba2"
                          />
                        )
                      })}
                      
                      {/* Year labels - show all years (starting from 1) */}
                      {Array.from({length: years}).map((_, idx) => {
                        const year = idx + 1 // Start from 1
                        const plotWidth = Math.max(years * 50, 1000) - 200
                        const segmentWidth = plotWidth / years
                        const x = 100 + (idx * segmentWidth) + (segmentWidth / 2)
                        return (
                          <text
                            key={idx}
                            x={x}
                            y="480"
                            fill="#666"
                            fontSize="11"
                            textAnchor="middle"
                          >
                            Y{year}
                          </text>
                        )
                      })}
                      
                      {/* Hover detection areas */}
                      {Array.from({length: years}).map((_, idx) => {
                        const year = idx + 1 // Start from 1
                        const plotWidth = Math.max(years * 50, 1000) - 200
                        // Match the same calculation as the lines - divide by years, and center like the data points
                        const segmentWidth = plotWidth / years
                        const x = 100 + (idx * segmentWidth) + (segmentWidth / 2)
                        
                        return (
                          <rect
                            key={`hover-${idx}`}
                            x={x - segmentWidth / 2}
                            y="40"
                            width={segmentWidth}
                            height="420"
                            fill="transparent"
                            onMouseEnter={() => setHoveredYear(year)}
                            onMouseLeave={() => setHoveredYear(null)}
                            style={{ cursor: 'crosshair' }}
                          />
                        )
                      })}
                      
                      {/* Hover indicator line */}
                      {hoveredYear !== null && (() => {
                        const plotWidth = Math.max(years * 50, 1000) - 200
                        // Match cash flow graphs: divide by years, and position at center of segment
                        // Years start at 1, so position is (year - 1) * segmentWidth
                        const segmentWidth = plotWidth / years
                        const x = 100 + ((hoveredYear - 1) * segmentWidth) + (segmentWidth / 2)
                        return (
                          <line
                            x1={x}
                            y1="40"
                            x2={x}
                            y2="460"
                            stroke="#999"
                            strokeWidth="2"
                            strokeDasharray="4,4"
                            opacity="0.7"
                          />
                        )
                      })()}
                      
                      {/* Tooltip */}
                      {hoveredYear !== null && (() => {
                        const plotWidth = Math.max(years * 50, 1000) - 200
                        // Match cash flow graphs: divide by years, and position at center of segment
                        // Years start at 1, so position is (year - 1) * segmentWidth
                        const segmentWidth = plotWidth / years
                        const x = 100 + ((hoveredYear - 1) * segmentWidth) + (segmentWidth / 2)
                        // cumulativeA is indexed by year-1 since years start at 1
                        const valueA = cumulativeA[hoveredYear - 1]?.value ?? 0
                        const valueB = cumulativeB[hoveredYear - 1]?.value ?? 0
                        const normalizedValueA = (valueA - minCumulative) / rangeCumulative
                        const normalizedValueB = (valueB - minCumulative) / rangeCumulative
                        const yA = 460 - (normalizedValueA * 420)
                        const yB = 460 - (normalizedValueB * 420)
                        
                        // Position tooltip to the right of the line, or left if too close to edge
                        const tooltipX = x + 20
                        const tooltipY = 100
                        
                        return (
                          <g>
                            {/* Tooltip background */}
                            <rect
                              x={tooltipX - 10}
                              y={tooltipY - 10}
                              width="200"
                              height="80"
                              fill="white"
                              stroke="#333"
                              strokeWidth="1"
                              rx="4"
                              opacity="0.95"
                            />
                            {/* Tooltip text */}
                            <text
                              x={tooltipX}
                              y={tooltipY + 10}
                              fill="#333"
                              fontSize="13"
                              fontWeight="600"
                            >
                              Year {hoveredYear}
                            </text>
                            <text
                              x={tooltipX}
                              y={tooltipY + 30}
                              fill="#667eea"
                              fontSize="12"
                            >
                              {optionA.name}: ${valueA.toLocaleString(undefined, {maximumFractionDigits: 0})}
                            </text>
                            <text
                              x={tooltipX}
                              y={tooltipY + 50}
                              fill="#764ba2"
                              fontSize="12"
                            >
                              {optionB.name}: ${valueB.toLocaleString(undefined, {maximumFractionDigits: 0})}
                            </text>
                            {/* Highlight points on lines */}
                            <circle
                              cx={x}
                              cy={yA}
                              r="6"
                              fill="#667eea"
                              stroke="white"
                              strokeWidth="2"
                            />
                            <circle
                              cx={x}
                              cy={yB}
                              r="6"
                              fill="#764ba2"
                              stroke="white"
                              strokeWidth="2"
                            />
                          </g>
                        )
                      })()}
                    </>
                  )
                })()}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Year-by-Year Breakdown */}
      <div className="breakdown-section">
        <h2>Year-by-Year Breakdown</h2>
        <div className="breakdown-grid">
          <div className="breakdown-card">
            <h3>{optionA.name}</h3>
            <div className="breakdown-table">
              <div className="breakdown-header">
                <span>Year</span>
                <span>Net Worth</span>
                <span>Value (No Interest)</span>
                <span>Interest Gain/Loss</span>
                <span>Cash Flow (Salary+Tuition)</span>
                <span>Total Gain/Loss</span>
              </div>
              {breakdownA.map((row, idx) => (
                <div key={idx} className="breakdown-row">
                  <span style={{color: '#333', fontWeight: '600'}}>{row.year}</span>
                  <span className={row.netWorth >= 0 ? 'positive' : 'negative'}>
                    ${row.netWorth.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </span>
                  <span className={row.valueWithoutInterest >= 0 ? 'positive' : 'negative'}>
                    ${row.valueWithoutInterest.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </span>
                  <span className={row.interestGainLoss >= 0 ? 'positive' : 'negative'}>
                    ${row.interestGainLoss.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </span>
                  <span className={row.cashFlowGainLoss >= 0 ? 'positive' : 'negative'}>
                    ${row.cashFlowGainLoss.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </span>
                  <span className={row.totalGainLoss >= 0 ? 'positive' : 'negative'}>
                    ${row.totalGainLoss.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="breakdown-card">
            <h3>{optionB.name}</h3>
            <div className="breakdown-table">
              <div className="breakdown-header">
                <span>Year</span>
                <span>Net Worth</span>
                <span>Value (No Interest)</span>
                <span>Interest Gain/Loss</span>
                <span>Cash Flow (Salary+Tuition)</span>
                <span>Total Gain/Loss</span>
              </div>
              {breakdownB.map((row, idx) => (
                <div key={idx} className="breakdown-row">
                  <span style={{color: '#333', fontWeight: '600'}}>{row.year}</span>
                  <span className={row.netWorth >= 0 ? 'positive' : 'negative'}>
                    ${row.netWorth.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </span>
                  <span className={row.valueWithoutInterest >= 0 ? 'positive' : 'negative'}>
                    ${row.valueWithoutInterest.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </span>
                  <span className={row.interestGainLoss >= 0 ? 'positive' : 'negative'}>
                    ${row.interestGainLoss.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </span>
                  <span className={row.cashFlowGainLoss >= 0 ? 'positive' : 'negative'}>
                    ${row.cashFlowGainLoss.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </span>
                  <span className={row.totalGainLoss >= 0 ? 'positive' : 'negative'}>
                    ${row.totalGainLoss.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OpportunityCostCalculator
