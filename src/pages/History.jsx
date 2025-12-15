const styles = `
.history-container {
  background: #f5f7fb;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 24px;
}

.history-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  flex: 1;
  display: flex;
  flex-direction: column;
}
`;

function History() {
  return (
    <>
      <style>{styles}</style>
      <section className="history-container">
        <div className="history-card">
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
        </div>
      </section>
    </>
  );
}

export default History;
