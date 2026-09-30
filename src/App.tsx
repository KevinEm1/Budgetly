import { useState, type FormEvent } from 'react'
import './App.css'

type Transaction = {
  id: number
  description: string
  amount: number
  type: 'income' | 'expense'
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

function App() {
  const [transactions, setTransactions] = useState(startingTransactions)
  const [showForm, setShownForm] = useState(false)

  const currentMonth = new Date().toISOString().slice(0, 7)

  const thisMonthTransactions = transactions.filter((transaction) => 
    transaction.date.startsWith(currentMonth),
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

  setTransactions((currentTransactions) => [
    ...currentTransactions,
    {
      id: Date.now(),
      description,
      amount,
      type,
      date
    },
    ...currentTransactions,
  ])

  form.reset()
  setShownForm(false)
}

return (
  <main className="app">
    <header className="topbar">
      <div>
        <p className="eyebrow">PERSONAL FINANCE DASHBOARD</p>
        <h1>Budgetly</h1>
      </div>

      <button className="add-button" onClick={() => setShownForm(!showForm)}>
        {showForm ? 'Cancel' : 'Add Transaction'}
      </button>
    </header>
    
    {showForm && (
      <section className="content-card">
        <h2>New Transaction</h2>
      
        <form onSubmit={handleSubmit}>
          <p>
            <label>
              Description
              <br />
              <input name="description" required placeholder="e.g. Groceries" />
            </label>
          </p>
          
          <p>
            <label>
              Amount
              <br />
              <input name="amount" type="number" min="0.01" step="0.01" required />
            </label>
          </p>

          <p>
            <label>
              Type
              <br />
              <select name="type" defaultValue="expense">
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </label>
          </p>

          <p>
            <label>
              Date
              <br />
              <input name="date" type="date" defaultValue={today} required />
            </label>
          </p>

          <button className="add-button" type="submit">
            Save Transaction
          </button>
        </form>
      </section>
    )}

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

    <section className="content-card">
      <h2>Recent transactions</h2>

      {transactions.map((transaction) => (
        <p key={transaction.id}>
          {transaction.description} - {transaction.type === 'income' ? '+' : '-'}
          {formatCurrency(transaction.amount)} on {transaction.date}
        </p>
      ))}
    </section>
  </main>
      )
    }
export default App