import { useState } from "react";
import "./App.css";

function App() {
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      name: "Daily Coffee",
      category: "Food & Dining",
      amount: 450,
      type: "expense",
      icon: "☕",
      date: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Shopping",
      category: "Shopping",
      amount: 3200,
      type: "expense",
      icon: "🛍️",
      date: new Date().toISOString(),
    },
    {
      id: 3,
      name: "Freelance Payment",
      category: "Income",
      amount: 25000,
      type: "income",
      icon: "💼",
      date: new Date().toISOString(),
    },
    {
      id: 4,
      name: "Transportation",
      category: "Transport",
      amount: 850,
      type: "expense",
      icon: "🚕",
      date: new Date().toISOString(),
    },
  ]);

  // =========================
  // NAVIGATION
  // =========================

  const [activePage, setActivePage] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // =========================
  // CHART
  // =========================

  const [chartPeriod, setChartPeriod] = useState("This Week");

  // =========================
  // TRANSACTION MODAL
  // =========================

  const [showTransactionModal, setShowTransactionModal] =
    useState(false);

  // =========================
  // LOGIN / SIGNUP
  // =========================

  const [authMode, setAuthMode] = useState(null);

  // =========================
  // USER
  // =========================

  const [user, setUser] = useState(null);

  // =========================
  // EDITING
  // =========================

  const [editingTransaction, setEditingTransaction] =
    useState(null);

  // =========================
  // FORM
  // =========================

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Other");

  // =========================
  // SEARCH
  // =========================

  const [search, setSearch] = useState("");

  // =========================
  // CALCULATIONS
  // =========================

  const income = transactions
    .filter(
      (transaction) =>
        transaction.type === "income"
    )
    .reduce(
      (total, transaction) =>
        total + transaction.amount,
      0
    );

  const expenses = transactions
    .filter(
      (transaction) =>
        transaction.type === "expense"
    )
    .reduce(
      (total, transaction) =>
        total + transaction.amount,
      0
    );

  const balance = income - expenses;

  // =========================
  // FILTER TRANSACTIONS
  // =========================

  const filteredTransactions =
    transactions.filter((transaction) => {
      const matchesSearch =
        transaction.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        transaction.category
          .toLowerCase()
          .includes(search.toLowerCase());

      if (activePage === "income") {
        return (
          transaction.type === "income" &&
          matchesSearch
        );
      }

      if (activePage === "expenses") {
        return (
          transaction.type === "expense" &&
          matchesSearch
        );
      }

      return matchesSearch;
    });

  // =========================
  // GREETING
  // =========================

  const currentHour = new Date().getHours();

  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
      ? "Good afternoon"
      : "Good evening";

  // =========================
  // CHART DATA
  // =========================

  const today = new Date();

  const getChartData = () => {
    if (chartPeriod === "This Week") {
      const days = Array.from(
        { length: 7 },
        (_, index) => {
          const date = new Date(today);

          date.setDate(
            today.getDate() - (6 - index)
          );

          return date;
        }
      );

      return days.map((date) => {
        const total = transactions
          .filter((transaction) => {
            if (
              transaction.type !== "expense" ||
              !transaction.date
            ) {
              return false;
            }

            const transactionDate =
              new Date(transaction.date);

            return (
              transactionDate.toDateString() ===
              date.toDateString()
            );
          })
          .reduce(
            (sum, transaction) =>
              sum + transaction.amount,
            0
          );

        return {
          label: date.toLocaleDateString(
            "en-US",
            {
              weekday: "short",
            }
          ),
          amount: total,
        };
      });
    }

    if (chartPeriod === "This Month") {
      const daysInMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      ).getDate();

      const numberOfWeeks = Math.ceil(
        daysInMonth / 7
      );

      return Array.from(
        { length: numberOfWeeks },
        (_, index) => {
          const startDay =
            index * 7 + 1;

          const endDay = Math.min(
            startDay + 6,
            daysInMonth
          );

          const total = transactions
            .filter((transaction) => {
              if (
                transaction.type !== "expense" ||
                !transaction.date
              ) {
                return false;
              }

              const transactionDate =
                new Date(transaction.date);

              return (
                transactionDate.getMonth() ===
                  today.getMonth() &&
                transactionDate.getFullYear() ===
                  today.getFullYear() &&
                transactionDate.getDate() >=
                  startDay &&
                transactionDate.getDate() <=
                  endDay
              );
            })
            .reduce(
              (sum, transaction) =>
                sum + transaction.amount,
              0
            );

          return {
            label: `${startDay}-${endDay}`,
            amount: total,
          };
        }
      );
    }

    // THIS YEAR

    return Array.from(
      { length: 12 },
      (_, index) => {
        const total = transactions
          .filter((transaction) => {
            if (
              transaction.type !== "expense" ||
              !transaction.date
            ) {
              return false;
            }

            const transactionDate =
              new Date(transaction.date);

            return (
              transactionDate.getFullYear() ===
                today.getFullYear() &&
              transactionDate.getMonth() ===
                index
            );
          })
          .reduce(
            (sum, transaction) =>
              sum + transaction.amount,
            0
          );

        return {
          label: new Date(
            today.getFullYear(),
            index,
            1
          ).toLocaleDateString("en-US", {
            month: "short",
          }),
          amount: total,
        };
      }
    );
  };

  const chartData = getChartData();

  const maxSpending = Math.max(
    ...chartData.map(
      (item) => item.amount
    ),
    100
  );

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setName("");
    setAmount("");
    setType("expense");
    setCategory("Other");
    setEditingTransaction(null);
  };

  // =========================
  // OPEN ADD MODAL
  // =========================

  const openAddModal = () => {
    resetForm();
    setShowTransactionModal(true);
  };

  // =========================
  // ADD / EDIT TRANSACTION
  // =========================

  const handleTransactionSubmit = (
    event
  ) => {
    event.preventDefault();

    if (
      !name.trim() ||
      !amount ||
      Number(amount) <= 0
    ) {
      alert(
        "Please enter a valid name and amount."
      );
      return;
    }

    if (editingTransaction) {
      setTransactions(
        (previousTransactions) =>
          previousTransactions.map(
            (transaction) =>
              transaction.id ===
              editingTransaction.id
                ? {
                    ...transaction,
                    name: name.trim(),
                    category,
                    amount: Number(amount),
                    type,
                    icon:
                      type === "income"
                        ? "💰"
                        : "💸",
                  }
                : transaction
          )
      );
    } else {
      const newTransaction = {
        id: Date.now(),
        name: name.trim(),
        category,
        amount: Number(amount),
        type,
        icon:
          type === "income"
            ? "💰"
            : "💸",
        date: new Date().toISOString(),
      };

      setTransactions(
        (previousTransactions) => [
          newTransaction,
          ...previousTransactions,
        ]
      );
    }

    resetForm();
    setShowTransactionModal(false);
  };

  // =========================
  // EDIT TRANSACTION
  // =========================

  const handleEditTransaction = (
    transaction
  ) => {
    setEditingTransaction(transaction);

    setName(transaction.name);
    setAmount(transaction.amount);
    setCategory(transaction.category);
    setType(transaction.type);

    setShowTransactionModal(true);
  };

  // =========================
  // DELETE TRANSACTION
  // =========================

  const handleDeleteTransaction = (
    id
  ) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this transaction?"
      );

    if (!confirmDelete) return;

    setTransactions(
      (previousTransactions) =>
        previousTransactions.filter(
          (transaction) =>
            transaction.id !== id
        )
    );
  };

  // =========================
  // LOGIN / SIGNUP
  // =========================

  const handleAuth = (event) => {
    event.preventDefault();

    const form = new FormData(
      event.currentTarget
    );

    const email = form.get("email");

    if (!email) {
      alert("Please enter your email.");
      return;
    }

    setUser({
      name:
        authMode === "signup"
          ? form.get("name") || "User"
          : "Rutaba",
      email,
    });

    setAuthMode(null);
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    setUser(null);
  };

  // =========================
  // PAGE TITLE
  // =========================

  const getPageTitle = () => {
    if (activePage === "transactions")
      return "All Transactions";

    if (activePage === "income")
      return "Income";

    if (activePage === "expenses")
      return "Expenses";

    return "Dashboard";
  };

  return (
    <div className="app">

      {/* ================= SIDEBAR ================= */}

 <aside className={`sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
  <div className="brand">
    <div className="brand-logo">S</div>
    <span>Spendly</span>

    <button
      className="mobile-close"
      onClick={() => setMobileMenuOpen(false)}
      aria-label="Close menu"
    >
      ×
    </button>
  </div>

  <nav className="sidebar-nav">
    <button
      className={`nav-item ${
        activePage === "dashboard" ? "active" : ""
      }`}
      onClick={() => {
        setActivePage("dashboard");
        setMobileMenuOpen(false);
      }}
    >
      <span className="nav-icon">⌂</span>
      Dashboard
    </button>

    <button
      className={`nav-item ${
        activePage === "transactions" ? "active" : ""
      }`}
      onClick={() => {
        setActivePage("transactions");
        setMobileMenuOpen(false);
      }}
    >
      <span className="nav-icon">↔</span>
      Transactions
    </button>

    <button
      className={`nav-item ${
        activePage === "income" ? "active" : ""
      }`}
      onClick={() => {
        setActivePage("income");
        setMobileMenuOpen(false);
      }}
    >
      <span className="nav-icon">↗</span>
      Income
    </button>

    <button
      className={`nav-item ${
        activePage === "expenses" ? "active" : ""
      }`}
      onClick={() => {
        setActivePage("expenses");
        setMobileMenuOpen(false);
      }}
    >
      <span className="nav-icon">↘</span>
      Expenses
    </button>
  </nav>
</aside>

      {/* ================= MAIN ================= */}

      <main className="main-content">
        <div className="mobile-navbar">
  <button
    className="hamburger-button"
    onClick={() => setMobileMenuOpen(true)}
    aria-label="Open menu"
  >
    ☰
  </button>

  <div className="mobile-brand">
    <div className="brand-logo">S</div>
    <span>Spendly</span>
  </div>

  <div className="mobile-navbar-actions">
    <button
      className="icon-button"
      onClick={() => {
        setActivePage("transactions");

        setTimeout(() => {
          document.getElementById("transaction-search")?.focus();
        }, 100);
      }}
      aria-label="Search transactions"
    >
      ⌕
    </button>

    {user ? (
      <div className="profile-wrapper">
        <button className="avatar">
          {user.name.charAt(0).toUpperCase()}
        </button>

        <div className="profile-menu">
          <strong>{user.name}</strong>
          <span>{user.email}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
    ) : (
      <button
        className="login-top-button"
        onClick={() => setAuthMode("login")}
      >
        Login
      </button>
    )}
  </div>
</div>

        {/* TOPBAR */}

        <header className="topbar">

          <div>
            <p className="eyebrow">
              PERSONAL FINANCE
            </p>

            <h1>
              {getPageTitle()}
            </h1>
          </div>

          <div className="topbar-actions">

            <button
              className="icon-button"
              onClick={() => {
                setActivePage(
                  "transactions"
                );

                setTimeout(() => {
                  document
                    .getElementById(
                      "transaction-search"
                    )
                    ?.focus();
                }, 100);
              }}
              aria-label="Search transactions"
            >
              ⌕
            </button>

            {user ? (
              <div className="profile-wrapper">

                <button className="avatar">
                  {user.name
                    .charAt(0)
                    .toUpperCase()}
                </button>

                <div className="profile-menu">
                  <strong>
                    {user.name}
                  </strong>

                  <span>
                    {user.email}
                  </span>

                  <button
                    onClick={
                      handleLogout
                    }
                  >
                    Logout
                  </button>
                </div>

              </div>
            ) : (
              <button
                className="login-top-button"
                onClick={() =>
                  setAuthMode("login")
                }
              >
                Login
              </button>
            )}

          </div>
        </header>

        {/* ================= DASHBOARD ================= */}

        {activePage === "dashboard" && (
          <>

            <section className="welcome-section">

              <div>
                <p className="welcome-label">
                  {greeting}
                </p>

                <h2>
                  Here's your financial
                  overview.
                </h2>
              </div>

              <button
                className="add-button"
                onClick={openAddModal}
              >
                <span>+</span>
                Add Transaction
              </button>

            </section>

            {/* STATS */}

            <section className="stats-grid">

              <div className="stat-card balance-card">

                <div className="stat-top">
                  <span>
                    Total Balance
                  </span>

                  <div className="stat-icon">
                    💰
                  </div>
                </div>

                <h3>
                  Rs.{" "}
                  {balance.toLocaleString()}
                </h3>

                <p className="stat-change positive">
                  +8.2%
                  <span>
                    {" "}
                    from last month
                  </span>
                </p>

              </div>

              <div className="stat-card">

                <div className="stat-top">
                  <span>
                    Income
                  </span>

                  <div className="stat-icon income-icon">
                    ↗
                  </div>
                </div>

                <h3>
                  Rs.{" "}
                  {income.toLocaleString()}
                </h3>

                <p className="stat-change positive">
                  +12.5%
                  <span>
                    {" "}
                    from last month
                  </span>
                </p>

              </div>

              <div className="stat-card">

                <div className="stat-top">
                  <span>
                    Expenses
                  </span>

                  <div className="stat-icon expense-icon">
                    ↘
                  </div>
                </div>

                <h3>
                  Rs.{" "}
                  {expenses.toLocaleString()}
                </h3>

                <p className="stat-change negative">
                  +4.8%
                  <span>
                    {" "}
                    from last month
                  </span>
                </p>

              </div>

            </section>

            {/* DASHBOARD GRID */}

            <section className="dashboard-grid">

              {/* SPENDING OVERVIEW */}

              <div className="panel spending-panel">

                <div className="panel-header">

                  <div>
                    <p className="panel-label">
                      OVERVIEW
                    </p>

                    <h3>
                      Spending Overview
                    </h3>
                  </div>

                  <select
                    className="period-select"
                    value={chartPeriod}
                    onChange={(event) =>
                      setChartPeriod(
                        event.target.value
                      )
                    }
                  >
                    <option>
                      This Week
                    </option>

                    <option>
                      This Month
                    </option>

                    <option>
                      This Year
                    </option>
                  </select>

                </div>

                <div className="chart">

                  <div className="chart-grid">

                    <span>
                      Rs.{" "}
                      {Math.round(
                        maxSpending
                      ).toLocaleString()}
                    </span>

                    <span>
                      Rs.{" "}
                      {Math.round(
                        maxSpending * 0.66
                      ).toLocaleString()}
                    </span>

                    <span>
                      Rs.{" "}
                      {Math.round(
                        maxSpending * 0.33
                      ).toLocaleString()}
                    </span>

                    <span>
                      Rs. 0
                    </span>

                  </div>

                  <div className="bars">

                    {chartData.map(
                      (day) => {

                        const height =
                          day.amount === 0
                            ? 4
                            : Math.max(
                                (day.amount /
                                  maxSpending) *
                                  100,
                                8
                              );

                        return (
                          <div
                            className="bar-container"
                            key={
                              day.label
                            }
                          >

                            <div
                              className="bar"
                              style={{
                                height: `${height}%`,
                              }}
                              title={`Rs. ${day.amount.toLocaleString()}`}
                            ></div>

                            <span>
                              {day.label}
                            </span>

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>

              </div>

              {/* RECENT TRANSACTIONS */}

              <div className="panel">

                <div className="panel-header">

                  <div>
                    <p className="panel-label">
                      RECENT
                    </p>

                    <h3>
                      Recent Transactions
                    </h3>
                  </div>

                  <button
                    className="view-button"
                    onClick={() =>
                      setActivePage(
                        "transactions"
                      )
                    }
                  >
                    View all
                  </button>

                </div>

                <TransactionList
                  transactions={transactions.slice(
                    0,
                    4
                  )}
                  onEdit={
                    handleEditTransaction
                  }
                  onDelete={
                    handleDeleteTransaction
                  }
                />

              </div>

            </section>

          </>
        )}

        {/* ================= ALL / INCOME / EXPENSES ================= */}

        {activePage !== "dashboard" && (

          <section className="page-section">

            <div className="page-heading">

              <div>

                <p className="panel-label">
                  {activePage ===
                  "transactions"
                    ? "ALL ACTIVITY"
                    : activePage.toUpperCase()}
                </p>

                <h2>
                  {getPageTitle()}
                </h2>

              </div>

              <button
                className="add-button"
                onClick={openAddModal}
              >
                <span>+</span>
                Add Transaction
              </button>

            </div>

            <div className="transaction-tools">

              <input
                id="transaction-search"
                className="search-input"
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

              <span className="transaction-count">
                {
                  filteredTransactions.length
                }{" "}
                transaction
                {filteredTransactions.length !==
                1
                  ? "s"
                  : ""}
              </span>

            </div>

            <div className="panel full-transactions-panel">

              <TransactionList
                transactions={
                  filteredTransactions
                }
                onEdit={
                  handleEditTransaction
                }
                onDelete={
                  handleDeleteTransaction
                }
              />

            </div>

          </section>

        )}

      </main>

      {/* ================= TRANSACTION MODAL ================= */}

      {showTransactionModal && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowTransactionModal(false)
          }
        >

          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() => {
                setShowTransactionModal(
                  false
                );
                resetForm();
              }}
            >
              ×
            </button>

            <p className="panel-label">
              {editingTransaction
                ? "EDIT TRANSACTION"
                : "NEW TRANSACTION"}
            </p>

            <h2>
              {editingTransaction
                ? "Edit Transaction"
                : "Add Transaction"}
            </h2>

            <form
              onSubmit={
                handleTransactionSubmit
              }
            >

              <label>
                Transaction Name
              </label>

              <input
                type="text"
                placeholder="e.g. Grocery shopping"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
              />

              <label>
                Amount
              </label>

              <input
                type="number"
                placeholder="Amount"
                min="1"
                value={amount}
                onChange={(event) =>
                  setAmount(
                    event.target.value
                  )
                }
              />

              <label>
                Category
              </label>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value
                  )
                }
              >
                <option value="Food & Dining">
                  Food & Dining
                </option>

                <option value="Shopping">
                  Shopping
                </option>

                <option value="Transport">
                  Transport
                </option>

                <option value="Bills">
                  Bills
                </option>

                <option value="Entertainment">
                  Entertainment
                </option>

                <option value="Other">
                  Other
                </option>
              </select>

              <label>
                Type
              </label>

              <select
                value={type}
                onChange={(event) =>
                  setType(
                    event.target.value
                  )
                }
              >
                <option value="expense">
                  Expense
                </option>

                <option value="income">
                  Income
                </option>
              </select>

              <button
                type="submit"
                className="modal-add"
              >
                {editingTransaction
                  ? "Save Changes"
                  : "Add Transaction"}
              </button>

            </form>

          </div>

        </div>

      )}

      {/* ================= LOGIN / SIGNUP ================= */}

      {authMode && (

        <div
          className="modal-overlay"
          onClick={() =>
            setAuthMode(null)
          }
        >

          <div
            className="auth-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                setAuthMode(null)
              }
            >
              ×
            </button>

            <div className="auth-logo">
              S
            </div>

            <h2>
              {authMode === "login"
                ? "Welcome back"
                : "Create your account"}
            </h2>

            <p className="auth-subtitle">
              {authMode === "login"
                ? "Login to continue to Spendly."
                : "Start managing your money with Spendly."}
            </p>

            <form onSubmit={handleAuth}>

              {authMode === "signup" && (
                <>
                  <label>
                    Full Name
                  </label>

                  <input
                    name="name"
                    type="text"
                    placeholder="Your name"
                  />
                </>
              )}

              <label>
                Email
              </label>

              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />

              <label>
                Password
              </label>

              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />

              <button
                type="submit"
                className="modal-add"
              >
                {authMode === "login"
                  ? "Login"
                  : "Create Account"}
              </button>

            </form>

            <div className="auth-switch">

              {authMode === "login" ? (
                <>
                  Don't have an account?

                  <button
                    onClick={() =>
                      setAuthMode("signup")
                    }
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?

                  <button
                    onClick={() =>
                      setAuthMode("login")
                    }
                  >
                    Login
                  </button>
                </>
              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

/* ================= TRANSACTION LIST ================= */

function TransactionList({
  transactions,
  onEdit,
  onDelete,
}) {
  if (transactions.length === 0) {
    return (
      <div className="empty-state">

        <div>💸</div>

        <p>
          No transactions found
        </p>

        <span>
          Try adding a transaction or
          changing your search.
        </span>

      </div>
    );
  }

  return (
    <div className="transactions">

      {transactions.map(
        (transaction) => (

          <div
            className="transaction"
            key={transaction.id}
          >

            <div className="transaction-left">

              <div className="transaction-icon">
                {transaction.icon}
              </div>

              <div>

                <strong>
                  {transaction.name}
                </strong>

                <span>
                  {transaction.category}
                </span>

              </div>

            </div>

            <div className="transaction-right">

              <strong
                className={
                  transaction.type ===
                  "income"
                    ? "income"
                    : "expense"
                }
              >
                {transaction.type ===
                "income"
                  ? "+"
                  : "-"}{" "}
                Rs.{" "}
                {transaction.amount.toLocaleString()}
              </strong>

              <div className="transaction-actions">

                <button
                  className="edit-button"
                  onClick={() =>
                    onEdit(transaction)
                  }
                >
                  Edit
                </button>

                <button
                  className="delete-button"
                  onClick={() =>
                    onDelete(
                      transaction.id
                    )
                  }
                >
                  Delete
                </button>

              </div>

            </div>

          </div>

        )
      )}

    </div>
  );
}

export default App;