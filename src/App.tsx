import './App.css'

function App() {
  return (
    <main className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">PERSONAL FINANCE DASHBOARD</p>
          <h1>Budgetly</h1>
        </div>

        <button className="add-button">+ Add transaction</button>
      </header>

      <section className="summary-grid">
        <article className="summary-card">
          <p>Total balance</p>
          <h2>$2,450.00</h2>
        </article>

        <article className="summary-card income">
          <p>Monthly income</p>
          <h2>$3,900.00</h2>
        </article>

        <article className="summary-card expense">
          <p>Monthly expenses</p>
          <h2>$1,450.00</h2>
        </article>
      </section>

      <section className="content-card">
        <h2>Recent transactions</h2>
        <p>Your transactions will appear here.</p>
      </section>
    </main>
  )
}

export default App