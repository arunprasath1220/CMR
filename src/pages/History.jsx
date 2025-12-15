function History() {
  return (
    <section className="card">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Activity log</p>
          <h1>History</h1>
          <p className="muted">
            Review the latest detections, escalations, and resolution notes.
          </p>
        </div>
        <span className="pill warning">In review</span>
      </div>
      <ul className="timeline">
        <li>
          <div className="dot" />
          <div>
            <p className="label">08:24</p>
            <p>New pothole detected near 5th Avenue.</p>
          </div>
        </li>
        <li>
          <div className="dot" />
          <div>
            <p className="label">07:10</p>
            <p>Severity updated to critical by inspector.</p>
          </div>
        </li>
        <li>
          <div className="dot" />
          <div>
            <p className="label">06:42</p>
            <p>Work order dispatched to maintenance crew.</p>
          </div>
        </li>
      </ul>
    </section>
  );
}

export default History;
