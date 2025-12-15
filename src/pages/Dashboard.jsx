function Dashboard() {
  return (
    <section className="card">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Live overview</p>
          <h1>Dashboard</h1>
          <p className="muted">
            Track active reports, recent detections, and overall network health
            at a glance.
          </p>
        </div>
        <span className="pill success">Online</span>
      </div>
      <div className="grid two">
        <div className="panel">
          <p className="label">Open reports</p>
          <h3>42</h3>
          <p className="muted">Needing review</p>
        </div>
        <div className="panel">
          <p className="label">Resolved this week</p>
          <h3>18</h3>
          <p className="muted">Up 12% vs last week</p>
        </div>
        <div className="panel">
          <p className="label">Avg. response</p>
          <h3>3h 24m</h3>
          <p className="muted">From detection to triage</p>
        </div>
        <div className="panel">
          <p className="label">Coverage</p>
          <h3>87%</h3>
          <p className="muted">City zones mapped</p>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
