import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import './App.css'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

type Transaction = {
  id: number
  description: string
  amount: number
  type: 'income' | 'expense'
  category?: string
  date: string
}

const today = new Date().toISOString().slice(0, 10)

const startingTransactions: Transaction[] = [
  {
    id: 1,
    description: 'Demo paycheck',
    amount: 3900,
    type: 'income',
    date: today
  },
  {
    id: 2,
    description: 'Demo expenses',
    amount: 1450,
    type: 'expense',
    date: today
  },
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const CATEGORY_COLORS: Record<string, string> = {
  Housing: '#6366f1',
  Food: '#22c55e',
  Transportation: '#f59e0b',
  Entertainment: '#ef4444',
  Shopping: '#06b6d4',
  Utilities: '#a855f7',
  Other: '#ec4899',
}

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTransactions = localStorage.getItem('budgetly-transactions')
    
  if (!savedTransactions) {
    return startingTransactions
  }

  try {
    return JSON.parse(savedTransactions) as Transaction[]
  } catch {
    return startingTransactions
  }
  })

  const [searchTerm, setSearchTerm] = useState('')

  const [showForm, setShownForm] = useState(false)

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const [transactionFilter, setTransactionFilter] = useState<
    'all' | 'income' | 'expense'
  >('all')

  const [category, setCategory] = useState('Other')

  const formRef = useRef<HTMLDivElement>(null)

  const [selectedMonth, setSelectedMonth] = useState(
  new Date().toLocaleDateString('en-CA', {
    year: 'numeric',
    month: '2-digit',
  }).replace('/', '-')
)

  const [monthlyBudgets, setMonthlyBudgets] = useState<Record<string, number>>(
  () => {
    const savedBudgets = localStorage.getItem('budgetly-monthly-budgets')

    if (savedBudgets) {
      try {
        return JSON.parse(savedBudgets) as Record<string, number>
      } catch {
        return {}
      }
    }

    return {}
  }
)

  useEffect(() => {
    localStorage.setItem('budgetly-transactions', JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
  localStorage.setItem(
    'budgetly-monthly-budgets',
    JSON.stringify(monthlyBudgets)
  )
}, [monthlyBudgets])

  const thisMonthTransactions = transactions.filter((transaction) =>
  transaction.date.startsWith(selectedMonth)
)

const totalBalance = transactions.reduce((total, transaction) => {
  return total + (transaction.type === 'income' ? transaction.amount : -transaction.amount)
}, 0)

const monthlyIncome = thisMonthTransactions
  .filter((transaction) => transaction.type === 'income')
  .reduce((total, transaction) => total + transaction.amount, 0)
 
const monthlyExpenses = thisMonthTransactions
  .filter((transaction) => transaction.type === 'expense')
  .reduce((total, transaction) => total + transaction.amount, 0)

const currentBudget = monthlyBudgets[selectedMonth] ?? 0

const remainingBudget = currentBudget - monthlyExpenses

const budgetPercentage =
  currentBudget > 0
    ? (monthlyExpenses / currentBudget) * 100
    : 0

function handleDelete(id: number, desctription: string) {
  const shouldDelete = window.confirm(`Delete "${desctription}"?`)

  if (!shouldDelete) {
    return
  }

  setTransactions((currentTransactions) =>
    currentTransactions.filter((transaction) => transaction.id !== id),
  )
}

function handleEdit(transaction: Transaction) {
  setEditingTransaction(transaction)
  setShownForm(true)
  setCategory(transaction.category ?? 'Other')
}

function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
  const form = event.currentTarget
  const formData = new FormData(form)
  const description = String(formData.get('description')).trim()
  const amount = Number(formData.get('amount'))
  const type = String(formData.get('type')) as Transaction['type']
  const date = String(formData.get('date'))

  if (!description || !Number.isFinite(amount) || amount <= 0 || !date) {
    return
  }

  if (editingTransaction) {
  setTransactions((currentTransactions) =>
    currentTransactions.map((transaction) =>
      transaction.id === editingTransaction.id
        ? {
            ...transaction,
            description,
            amount,
            type,
            date,
            category,
          }
        : transaction,
    ),
  )

  setEditingTransaction(null)
} else {
  setTransactions((currentTransactions) => [
    {
      id: Date.now(),
      description,
      amount,
      type,
      date,
      category,
    },
    ...currentTransactions,
  ])
}

  form.reset()
setCategory('Other')
setShownForm(false)
}

const visibleTransactions = thisMonthTransactions.filter((transaction) =>
  transactionFilter === 'all' || transaction.type === transactionFilter
)

const searchedTransactions = visibleTransactions.filter((transaction) =>
  transaction.description
    .toLowerCase()
    .includes(searchTerm.toLowerCase().trim())
)

const expensesByCategory = thisMonthTransactions
  .filter((transaction) => transaction.type === 'expense')
  .reduce<Record<string, number>>((totals, transaction) => {
    const category = transaction.category ?? 'Other'

    totals[category] = (totals[category] ?? 0) + transaction.amount

    return totals
  }, {})

const chartData = Object.entries(expensesByCategory).map(
  ([name, value]) => ({
    name,
    value,
  })
)

useLayoutEffect(() => {
  if (editingTransaction && showForm) {
    formRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}, [editingTransaction, showForm])

return (
  <main className="app">
    <header className="topbar">
      <div>
        <p className="eyebrow">PERSONAL FINANCE DASHBOARD</p>
        <h1>Budgetly</h1>
      </div>

      <button
        className="add-button"
        onClick={() => {
          setShownForm(!showForm)
          setEditingTransaction(null)
        }}
      >
        {showForm ? 'Cancel' : 'Add Transaction'}
      </button>
    </header>
    
    {showForm && (
      <section className="content-card" ref={formRef}>
        <h2>{editingTransaction ? 'Edit Transaction' : 'New Transaction'}</h2>
      
        <form onSubmit={handleSubmit}>
          <p>
            <label>
              Description
              <br />
              <input 
                name="description" 
                required 
                placeholder="e.g. Groceries" 
                defaultValue={editingTransaction?.description ?? ''} 
              />
            </label>
          </p>
          
          <p>
            <label>
              Amount
              <br />
              <input 
                name="amount" 
                type="number" 
                min="0.01" 
                step="0.01" 
                required 
                defaultValue={editingTransaction?.amount ?? ''} 
              />
            </label>
          </p>

          <p>
            <label>
              Type
              <br />
              <select name="type" defaultValue={editingTransaction?.type ?? 'expense'}>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </label>
          </p>

          <select
  value={category}
  onChange={(e) => setCategory(e.target.value)}
>
  <option value="Housing">Housing</option>
  <option value="Food">Food</option>
  <option value="Transportation">Transportation</option>
  <option value="Entertainment">Entertainment</option>
  <option value="Shopping">Shopping</option>
  <option value="Utilities">Utilities</option>
  <option value="Other">Other</option>
</select>

          <p>
            <label>
              Date
              <br />
              <input name="date" type="date" defaultValue={editingTransaction?.date ?? today} required />
            </label>
          </p>

          <button className="add-button" type="submit">
            {editingTransaction ? 'Update Transaction' : 'Save Transaction'}
          </button>
        </form>
      </section>
    )}

    <div className="month-filter">
  <label htmlFor="month">Select Month:</label>
  <input
    id="month"
    type="month"
    value={selectedMonth}
    onChange={(e) => setSelectedMonth(e.target.value)}
  />
</div>

<div className="budget-goal">
  <h2>Monthly Budget Goal</h2>

  <label htmlFor="budgetAmount">
    Set Spending Limit:
  </label>

  <input
    id="budgetAmount"
    type="number"
    min="0"
    step="0.01"
    placeholder="Enter monthly budget"
    value={monthlyBudgets[selectedMonth] ?? ''}
    onChange={(e) => {
      const value = e.target.value

      setMonthlyBudgets((previous) => {
        const updated = { ...previous }

        if (value === '') {
          delete updated[selectedMonth]
        } else {
          updated[selectedMonth] = Number(value)
        }

        return updated
      })
    }}
  />
</div>

<div className="budget-progress">
  <h3>Monthly Budget Progress</h3>

  {currentBudget > 0 ? (
    <>
      <p>
        {formatCurrency(monthlyExpenses)} spent of{' '}
        {formatCurrency(currentBudget)}
      </p>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${Math.min(budgetPercentage, 100)}%`,
            backgroundColor:
              budgetPercentage >= 100 ? '#ef4444' : '#6366f1',
          }}
        />
      </div>

      <p>
        {remainingBudget >= 0
          ? `${formatCurrency(remainingBudget)} remaining`
          : `${formatCurrency(Math.abs(remainingBudget))} over budget`}
      </p>
    </>
  ) : (
    <p>Set a monthly budget to track your spending.</p>
  )}
</div>

    <section className="summary-grid">
      <article className="summary-card">
        <p>Total Balance</p>
        <h2>{formatCurrency(totalBalance)}</h2>
      </article>

      <article className="summary-card income">
        <p>Monthly Income</p>
        <h2>{formatCurrency(monthlyIncome)}</h2>
      </article>

      <article className="summary-card expense">
        <p>Monthly Expenses</p>
        <h2>{formatCurrency(monthlyExpenses)}</h2>
      </article>
    </section>

    <section className="expense-chart">
  <h2>Expenses by Category</h2>

  {chartData.length > 0 ? (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {chartData.map((entry) => (
  <Cell
    key={entry.name}
    fill={CATEGORY_COLORS[entry.name] ?? CATEGORY_COLORS.Other}
  />
))}
        </Pie>
        <Tooltip
  formatter={(value) =>
    Number(value).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    })
  }
/>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  ) : (
    <p>No expenses to display yet.</p>
  )}
</section>

    <section className="content-card">
      <h2>Recent transactions</h2>

<div className="filter-buttons">
  <button
    type="button"
    className={transactionFilter === 'all' ? 'filter-button active' : 'filter-button'}
    onClick={() => setTransactionFilter('all')}
  >
    All
  </button>

  <button
    type="button"
    className={transactionFilter === 'income' ? 'filter-button active' : 'filter-button'}
    onClick={() => setTransactionFilter('income')}
  >
    Income
  </button>

  <button
    type="button"
    className={transactionFilter === 'expense' ? 'filter-button active' : 'filter-button'}
    onClick={() => setTransactionFilter('expense')}
  >
    Expenses
  </button>
</div>

<div className="search-container">
  <input
    type="text"
    placeholder="Search transactions..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>

{searchedTransactions.length === 0 && (
  <p className="no-transactions">
    No transactions found.
  </p>
)}

    <div className="transactions-list">
      {searchedTransactions.map((transaction) => (
        <div className="transaction-row" key={transaction.id}>
          <div className="transaction-info">
            <strong>{transaction.description}</strong>
            <span>{transaction.date}</span>
          </div>

          <span className={`transaction-amount ${transaction.type}`}>
            {transaction.type === 'income' ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </span>

        <div className="transaction-actions">
          <button
            className="edit-button"
            type="button"
            onClick={() => handleEdit(transaction)}
          >
            Edit
          </button>

          <button
            className="delete-button"
            type="button"
            onClick={() => handleDelete(transaction.id, transaction.description)}
            aria-label={`Delete ${transaction.description}`}
          >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
    </section>
  </main>
      )
    }
export default App